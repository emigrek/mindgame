import { ClientPresenceStatusData, Guild, GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";

import voiceActivitySchema, { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import presenceActivitySchema, { PresenceActivityDocument } from "@/modules/schemas/PresenceActivity";

import mongoose from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "@/modules/user";
import { Guild as DatabaseGuild, PresenceActivity, User as DatabaseUser } from "@/interfaces";
import { config } from "@/config";
import { UserDocument } from "../schemas/User";
import i18n from "@/client/i18n";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const checkForDailyReward = async (client: ExtendedClient, member: GuildMember) => {
    const userLastVoiceActivity = await voiceActivityModel.findOne({
        userId: member.id,
        guildId: member.guild.id,
        to: { $ne: null }
    }).sort({ to: -1 }).limit(1);

    if (!userLastVoiceActivity) {
        await updateUserStatistics(client, member.user, {
            exp: config.dailyRewardExperience
        });

        client.emit("userRecievedDailyReward", member.user, member.guild, moment().add(1, "days").unix());
        return true;
    }

    if (!userLastVoiceActivity.to) return false;

    const daysSinceLastActivity = moment().diff(moment(userLastVoiceActivity.to), "days");
    if (daysSinceLastActivity < 1) {
        return false;
    }

    await updateUserStatistics(client, member.user, {
        exp: config.dailyRewardExperience
    });

    client.emit("userRecievedDailyReward", member.user, member.guild, moment().add(1, "days").unix());

    return true;
};

const checkLongVoiceBreak = async (client: ExtendedClient, member: GuildMember) => {
    const activity = await getLastVoiceActivity(member);
    if (!activity) {
        client.emit("userBackFromLongVoiceBreak", member);
        return true;
    }

    if (!activity.to) return false;

    const hoursSinceLastActivity = moment().diff(moment(activity.to), "hours");
    if (hoursSinceLastActivity < config.userLongBreakHours) {
        return false;
    }

    client.emit("userBackFromLongVoiceBreak", member);
    return true;
};

const checkGuildVoiceEmpty = async (client: ExtendedClient, guild: Guild, channel: VoiceBasedChannel) => {
    const activeVoiceActivities = await getGuildActiveVoiceActivities(guild);
    if (activeVoiceActivities.length) return;

    client.emit("guildVoiceEmpty", guild, channel);
};

const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel): Promise<VoiceActivityDocument | null> => {
    if (
        member.user.bot ||
        member.guild.afkChannel && channel.equals(member.guild.afkChannel)
    ) return null;

    const exists = await getVoiceActivity(member);
    if (exists) return null;

    await checkForDailyReward(client, member);
    await checkLongVoiceBreak(client, member);

    const newVoiceActivity = new voiceActivityModel({
        userId: member.id,
        channelId: channel.id,
        voiceStateId: member.voice?.id,
        guildId: member.guild.id,
        streaming: member.voice?.streaming,
        from: moment().toDate()
    });

    await newVoiceActivity.save();
    return newVoiceActivity;
}

const startPresenceActivity = async (client: ExtendedClient, userId: string, guildId: string, presence: Presence): Promise<PresenceActivityDocument> => {
    const exists = await getPresenceActivity(userId, guildId);
    if (exists) return exists;

    const newPresenceActivity = new presenceActivityModel({
        userId: userId,
        guildId: guildId,
        from: moment().toDate(),
        status: presence.status,
        client: getPresenceClientStatus(presence.clientStatus)
    });

    await newPresenceActivity.save();
    return newPresenceActivity;
};

const endPresenceActivity = async (client: ExtendedClient, userId: string, guildId: string): Promise<PresenceActivityDocument | null> => {
    const exists = await getPresenceActivity(userId, guildId);
    if (!exists) return null;

    exists.to = moment().toDate();
    await exists.save();

    return exists;
}

const endVoiceActivity = async (client: ExtendedClient, member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const exists = await getVoiceActivity(member);
    if (!exists) return null;

    exists.to = moment().toDate();
    await exists.save();

    return exists;
}

const validateVoiceActivities = async (client: ExtendedClient) => {
    const activities = await voiceActivityModel.find({
        to: null
    });

    const outOfSync: string[] = [];
    for await (const activity of activities) {
        const { userId, guildId, channelId } = activity;
        const guild = await client.guilds.fetch(guildId)
            .catch(() => null);
        if (!guild) continue;

        const member = await guild.members.fetch(userId)
            .catch(() => null);
        if (!member) continue;
        
        const channel = client.channels.cache.get(channelId) as VoiceBasedChannel;
        if (!channel) {
            outOfSync.push(userId);
            activity.delete();
            continue;
        }

        if (!member.voice?.channelId || !member.voice?.channel) {
            outOfSync.push(userId);
            activity.delete();
            continue;
        }

        if (!member.voice.channel.equals(channel)) {
            outOfSync.push(userId);
            activity.channelId = member.voice.channel.id;
            await activity.save();
            continue;
        }

        if (member.voice.channelId == member.guild.afkChannelId) {
            outOfSync.push(userId);
            activity.delete();
            continue;
        }
    }

    return outOfSync;
};

const validatePresenceActivities = async (client: ExtendedClient) => {
    const activities = await presenceActivityModel.find({
        to: null
    });

    const outOfSync: string[] = [];
    for await (const activity of activities) {
        const { userId, guildId } = activity;

        const guild = await client.guilds.fetch(guildId)
            .catch(() => null);
        if (!guild) continue;

        const member = await guild.members.fetch(userId)
            .catch(() => null);
        if (!member) continue;

        const presence = member.presence;
        if (!presence) {
            outOfSync.push(userId);
            activity.delete();
            continue;
        }

        if (presence.status !== activity.status) {
            outOfSync.push(userId);
            activity.status = presence.status;
            await activity.save();
            continue;
        }

        const oldClient = activity.client;
        const newClient = getPresenceClientStatus(presence.clientStatus);

        if (oldClient !== newClient) {
            outOfSync.push(userId);
            activity.client = newClient;
            await activity.save();
            continue;
        }
    }

    return outOfSync;
};

const getVoiceActivityBetween = async (guild: DatabaseGuild, startDate: Date, endDate: Date): Promise<VoiceActivityDocument[]> => {
    const activities = await voiceActivityModel.find({
        guildId: guild.guildId,
        from: {
            $gte: startDate,
        },
        $or: [
            { to: { $eq: null } },
            { to: { $lte: endDate } }
        ]
    });

    return activities;
}

const getPresenceActivityBetween = async (guild: DatabaseGuild, startDate: Date, endDate: Date): Promise<PresenceActivityDocument[]> => {
    const activities = await presenceActivityModel.find({
        guildId: guild.guildId,
        from: {
            $gte: startDate,
        },
        $or: [
            { to: { $eq: null } },
            { to: { $lte: endDate } }
        ]
    });

    return activities;
}

const getPresenceClientStatus = (clientStatus: ClientPresenceStatusData | null): string => {
    if (!clientStatus)
        return 'unknown';
    else if (clientStatus.desktop)
        return 'desktop';
    else if (clientStatus.mobile)
        return 'mobile';
    else if (clientStatus.web)
        return 'web';
    else
        return 'unknown';
}

const getVoiceActivity = async (member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const exists = await voiceActivityModel.findOne({ userId: member.user.id, guildId: member.guild.id, to: null });
    return exists;
};

const getLastVoiceActivity = async (member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const last = await voiceActivityModel.findOne({ userId: member.user.id }).sort({ to: -1 });
    return last;
};

const getUserVoiceActivity = async (user: DatabaseUser): Promise<VoiceActivityDocument | null> => {
    const exists = await voiceActivityModel.findOne({ userId: user.userId, to: null });
    return exists;
}

const getLastUserVoiceActivity = async (user: DatabaseUser): Promise<VoiceActivityDocument | null> => {
    const entries = await voiceActivityModel.aggregate([
        {
            $match: {
                userId: user.userId
            }
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $limit: 1
        }
    ]);
    
    return entries[0];
};

const getPresenceActivity = async (userId: string, guildId: string): Promise<PresenceActivityDocument | null> => {
    const exists = await presenceActivityModel.findOne({ userId: userId, guildId: guildId, to: null });
    return exists;
}

const getUserPresenceActivity = async (user: DatabaseUser): Promise<PresenceActivityDocument | null> => {
    const exists = await presenceActivityModel.findOne({ userId: user.userId, to: null });
    return exists;
}

const getLastUserPresenceActivity = async (user: DatabaseUser): Promise<PresenceActivityDocument | null> => {
    const entries = await presenceActivityModel.aggregate([
        {
            $match: {
                userId: user.userId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 1
        }
    ]);
    
    return entries[0];
};

const getGuildActiveVoiceActivities = async (guild: Guild): Promise<VoiceActivityDocument[]> => {
    const activities = await voiceActivityModel.find({ guildId: guild.id, to: null });
    return activities;
};

interface ActivitiesByChannelId<T> {
    _id: string;
    activities: T[];
}

interface VoiceActivityDocumentWithSeconds extends VoiceActivityDocument {
    seconds: number;
}

interface PresenceActivityDocumentWithSeconds extends PresenceActivityDocument {
    seconds: number;
}

const getVoiceActivitiesByChannelId = async (): Promise<ActivitiesByChannelId<VoiceActivityDocumentWithSeconds>[]> => {
    const voiceActivities = await voiceActivityModel.aggregate([
        {
            $match: {
                to: null
            }
        },
        {
            $addFields: {
                seconds: {
                    $round: [
                        {
                            $divide: [
                                { $subtract: [new Date(), "$from"] },
                                1000
                            ]
                        },
                        0
                    ]
                }
            },
        },
        {
            $group: {
                _id: "$channelId",
                activities: { $push: "$$ROOT" }
            }
        }
    ]);
    return voiceActivities;
}

const getPresenceActivitiesByGuildId = async (): Promise<ActivitiesByChannelId<PresenceActivityDocumentWithSeconds>[]> => {
    const presenceActivities = await presenceActivityModel.aggregate([
        {
            $match: {
                to: null
            }
        },
        {
            $addFields: {
                seconds: {
                    $round: [
                        {
                            $divide: [
                                { $subtract: [new Date(), "$from"] },
                                1000
                            ]
                        },
                        0
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$guildId",
                activities: { $push: "$$ROOT" }
            }
        }
    ]);
    return presenceActivities;
}

const pruneActivities = async () => {
    try {
        const twoMonthsAgo = moment().subtract(2, "months").toDate();
        await voiceActivityModel.deleteMany({ createdAt: { $lte: twoMonthsAgo } });
        await presenceActivityModel.deleteMany({ createdAt: { $lte: twoMonthsAgo } });
    } catch (e) {
        console.error(e);
    }
};

interface UserLastActivityDetails {
    voice: {
        activity: VoiceActivityDocument;
        guildName: string | null;
        guildId: string;
        channelId: string;
    } | null;
    presence: {
        activity: PresenceActivityDocument;
        guildName: string | null;
        guildId: string;
        client: string;
    } | null;
}

const getUserLastActivityDetails = async (client: ExtendedClient, user: UserDocument): Promise<UserLastActivityDetails> => {
    const lastVoiceActivity = await getLastUserVoiceActivity(user);
    const lastPresenceActivity = await getLastUserPresenceActivity(user);

    const lastVoiceActivityGuild = lastVoiceActivity ? await client.guilds.fetch(lastVoiceActivity.guildId) : null;
    const lastPresenceActivityGuild = lastPresenceActivity ? await client.guilds.fetch(lastPresenceActivity.guildId) : null;

    const voice = lastVoiceActivity ? {
        activity: lastVoiceActivity,
        guildName: lastVoiceActivityGuild ? lastVoiceActivityGuild.name : null,
        guildId: lastVoiceActivity.guildId,
        channelId: lastVoiceActivity.channelId
    } : null;

    const presence = lastPresenceActivity ? {
        activity: lastPresenceActivity,
        guildName: lastPresenceActivityGuild ? lastPresenceActivityGuild.name : null,
        guildId: lastPresenceActivity.guildId,
        client: clientStatusToEmoji(lastPresenceActivity.client)
    } : null;

    return {
        voice,
        presence
    };
};

const formatLastActivityDetails = (details: UserLastActivityDetails) => {
    let voice, presence;

    if (!details.voice) {
        voice = ""
    } else if (details.voice.activity.to !== null) {
        voice = i18n.__mf("profile.lastVoiceActivity", {
            time: `<t:${moment(details.voice.activity.to).unix()}:R>`,
            guild: `[${details.voice.guildName}](https://discord.com/channels/${details.voice.guildId}/${details.voice.channelId})`,
        });
    } else {
        voice = i18n.__mf("profile.currentVoiceActivity", {
            time: `<t:${moment(details.voice.activity.from).unix()}:t>`,
            guild: `[${details.voice.guildName}](https://discord.com/channels/${details.voice.guildId}/${details.voice.channelId})`,
        });
    }

    if (!details.presence) {
        presence = "";
    } else if (details.presence.activity.to !== null) {
        presence = i18n.__mf("profile.lastPresenceActivity", {
            time: `<t:${moment(details.presence.activity.to).unix()}:R>`,
            guild: `[${details.presence.guildName}](https://discord.com/channels/${details.presence.guildId})`,
            client: details.presence.client
        });
    } else {
        presence = i18n.__mf("profile.currentPresenceActivity", {
            time: `<t:${moment(details.presence.activity.from).unix()}:t>`,
            guild: `[${details.presence.guildName}](https://discord.com/channels/${details.presence.guildId})`,
            client: details.presence.client
        });
    }

    return `${voice}\n${presence}`;
};

const getPresenceActivityColor = (activity: PresenceActivity | null) => {
    const colors = [
        {
            name: 'online',
            color: '#3ba55d'
        },
        {
            name: 'idle',
            color: '#faa81a'
        },
        {
            name: 'dnd',
            color: '#faa81a'
        },
        {
            name: 'offline',
            color: '#68717e'
        }
    ];

    if (!activity) return '#68717e';
    const color = colors.find(c => c.name === activity.status);
    if (color) return color.color;
    return '#68717e';
}

const clientStatusToEmoji = (client: string) => {
    switch (client) {
        case 'desktop':
            return '🖥'
        case 'mobile':
            return '📱';
        case 'web':
            return '🌐';
        default:
            return '❔';
    }
}

export { formatLastActivityDetails, pruneActivities, PresenceActivityDocumentWithSeconds, VoiceActivityDocumentWithSeconds, ActivitiesByChannelId, clientStatusToEmoji, getVoiceActivitiesByChannelId, getPresenceActivitiesByGuildId, getUserLastActivityDetails, getLastUserPresenceActivity, getLastUserVoiceActivity, getLastVoiceActivity, getPresenceClientStatus, checkGuildVoiceEmpty, startVoiceActivity, getGuildActiveVoiceActivities, getUserPresenceActivity, getVoiceActivityBetween, getPresenceActivityBetween, getPresenceActivityColor, getUserVoiceActivity, startPresenceActivity, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, voiceActivityModel, validateVoiceActivities, validatePresenceActivities };
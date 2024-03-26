import ExtendedClient from "@/client/ExtendedClient";
import {ClientPresenceStatusData, Guild, GuildMember, Presence, VoiceBasedChannel} from "discord.js";

import presenceActivitySchema, {PresenceActivityDocument} from "@/modules/schemas/PresenceActivity";
import voiceActivitySchema, {VoiceActivityDocument} from "@/modules/schemas/VoiceActivity";

import i18n from "@/client/i18n";
import {config} from "@/config";
import {Streak, VoiceActivityStreak} from "@/interfaces";
import moment from "moment";
import mongoose from "mongoose";
import {updateUserGuildStatistics} from "@/modules/user-guild-statistics";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const checkVoiceActivityRewards = async (client: ExtendedClient, member: GuildMember) => {
    const activity = await getUserLastGuildVoiceActivity(member.user.id, member.guild.id);
    const streak = await getUserVoiceActivityStreak(member.user.id, member.guild.id);

    if (!activity) {
        await updateUserGuildStatistics({
            client,
            userId: member.user.id,
            guildId: member.guild.id,
            update: {
                exp: config.dailyRewardExperience
            }
        });
        client.emit("userReceivedDailyReward", member.user.id, member.guild.id, streak);
        return;
    }

    const activityDay = moment(activity.from).startOf("day");
    const today = moment().startOf("day");

    if (!activityDay.isBefore(today) || activityDay.isSame(today)) {
        return;
    }

    await updateUserGuildStatistics({
        client,
        userId: member.user.id,
        guildId: member.guild.id,
        update: {
            exp: config.dailyRewardExperience + (streak.isSignificant ? config.voiceSignificantActivityStreakReward : 0)
        }
    });

    client.emit("userReceivedDailyReward", member.user.id, member.guild.id, streak);
    if (streak.isSignificant) client.emit("userSignificantVoiceActivityStreak", member, streak);
};

const checkLongVoiceBreak = async (client: ExtendedClient, member: GuildMember) => {
    const activity = await getLastVoiceActivity(member.user.id);
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
    const activeVoiceActivities = await getGuildActiveVoiceActivities(guild.id);
    if (activeVoiceActivities.length) return;

    client.emit("guildVoiceEmpty", guild.id, channel);
};

const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel): Promise<VoiceActivityDocument | null> => {
    if (
        member.user.bot ||
        member.guild.afkChannel && channel.equals(member.guild.afkChannel)
    ) return null;

    const exists = await getVoiceActivity({ userId: member.id, guildId: member.guild.id });
    if (exists) return null;

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
    await checkVoiceActivityRewards(client, member);

    return newVoiceActivity;
}

const startPresenceActivity = async (userId: string, guildId: string, presence: Presence): Promise<PresenceActivityDocument> => {
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

const endPresenceActivity = async (userId: string, guildId: string): Promise<PresenceActivityDocument | null> => {
    const exists = await getPresenceActivity(userId, guildId);
    if (!exists) return null;

    exists.to = moment().toDate();
    await exists.save();

    return exists;
}

const endVoiceActivity = async (member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const exists = await getVoiceActivity({ userId: member.id, guildId: member.guild.id });
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
        }
    }

    return outOfSync;
};

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

interface GetVoiceActivityProps {
    userId: string;
    guildId: string;
}

const getVoiceActivity = async ({ userId, guildId }: GetVoiceActivityProps): Promise<VoiceActivityDocument | null> => {
    const exists = await voiceActivityModel.findOne({ userId, guildId, to: null });
    return exists;
};

const getLastVoiceActivity = async (userId: string): Promise<VoiceActivityDocument | null> => {
    const last = await voiceActivityModel.findOne({ userId }).sort({ to: -1 });
    return last;
};

const getLastUserVoiceActivity = async (userId: string): Promise<VoiceActivityDocument | null> => {
    const entries = await voiceActivityModel.aggregate([
        {
            $match: {
                userId
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

const getLastUserPresenceActivity = async (userId: string): Promise<PresenceActivityDocument | null> => {
    const entries = await presenceActivityModel.aggregate([
        {
            $match: {
                userId
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

interface VoiceActivityDocumentWithSeconds extends VoiceActivityDocument {
    seconds: number;
}

interface PresenceActivityDocumentWithSeconds extends PresenceActivityDocument {
    seconds: number;
}

interface VoiceActivitiesByChannelId {
    _id: string;
    activities: VoiceActivityDocumentWithSeconds[];
}

interface PresenceActivitiesByGuildId {
    _id: string;
    activities: PresenceActivityDocumentWithSeconds[];
}

const getVoiceActivitiesByChannelId = async (): Promise<VoiceActivitiesByChannelId[]> => {
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

const getPresenceActivitiesByGuildId = async (): Promise<PresenceActivitiesByGuildId[]> => {
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

const getUserClientsTime = async (userId: string): Promise<PresenceActivityDocumentWithSeconds[]> => {
    const presenceActivities = await presenceActivityModel.aggregate([
        {
            $match: {
                userId,
                to: { $ne: null }
            }
        },
        {
            $addFields: {
                seconds: {
                    $round: [
                        {
                            $divide: [
                                { $subtract: ["$to", "$from"] },
                                1000
                            ]
                        },
                        0
                    ]
                }
            }
        },
        {
            $sort: {
                from: -1
            }
        }
    ]);

    return presenceActivities;
}

const getUserVoiceActivityStreak = async (userId: string, guildId: string): Promise<VoiceActivityStreak> => {
    const activities = 
        await voiceActivityModel.find({
            userId,
            guildId,
        })
        .sort({ from: 1 });
    
    const dates = activities.map(activity => moment(activity.from));

    let last = dates.at(0);
    let streak: Streak | undefined = undefined;
    let maxStreak: Streak | undefined = undefined;

    for (const date of dates) {
        if (!last || date.isSame(last, "day"))
            continue;

        if (date.dayOfYear() === last.dayOfYear() + 1) {
            if (!streak) {
                streak = { 
                    date: date.toDate(), 
                    value: 1, 
                    startedAt: date.toDate() 
                };
                maxStreak = { 
                    date: date.toDate(), 
                    value: 1, 
                    startedAt: date.toDate() 
                };
            }

            streak.value++;
            if (maxStreak) {
                maxStreak.value = Math.max(streak.value, maxStreak.value);
            }
        } else {
            streak = { 
                date: date.toDate(), 
                value: 1, 
                startedAt: date.toDate() 
            };
        }

        last = date;
    }

    return config.voiceActivityStreakLogic({ streak, maxStreak });
};

const pruneActivities = async () => {
    try {
        const twoYearsAgo = moment().subtract(2, "year").toDate();
        await voiceActivityModel.deleteMany({ createdAt: { $lte: twoYearsAgo } });
        await presenceActivityModel.deleteMany({ createdAt: { $lte: twoYearsAgo } });
    } catch (e) {
        console.error(e);
    }
};

const getUserLastGuildVoiceActivity = async (userId: string, guildId: string): Promise<VoiceActivityDocument | undefined> => {
    const query = await voiceActivityModel.find({
        userId,
        guildId,
        to: { $ne: null }
    }).sort({ from: -1 }).limit(1);
    return query.at(0);
};

const getGuildActiveVoiceActivities = async (guildId: string): Promise<VoiceActivityDocument[]> => {
    return voiceActivityModel.find({ guildId, to: null });
}

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

const getUserLastActivityDetails = async (client: ExtendedClient, userId: string): Promise<UserLastActivityDetails> => {
    const lastVoiceActivity = await getLastUserVoiceActivity(userId);
    const lastPresenceActivity = await getLastUserPresenceActivity(userId);

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

interface GetUserClientProps {
    clients: string[];
    mostUsed?: string;
}

const getUserClients = async (userId: string): Promise<GetUserClientProps> => {
    const clients = new Map<string, number>();
    const activities = await getUserClientsTime(userId);

    for (const activity of activities) {
        const client = activity.client;
        if (!clients.has(client)) {
            clients.set(client, activity.seconds);
        }

        const current = clients.get(client);
        if (current !== undefined) {
            clients.set(client, current + activity.seconds);
        }
    }

    const set = new Set(Array.from(clients.keys()));
    const mostUsed = Array.from(clients).sort((a, b) => b[1] - a[1])[0];

    return {
        clients: Array.from(set),
        mostUsed: mostUsed ? mostUsed[0] : undefined,
    };
}

const clientStatusToEmoji = (client: string) => {
    switch (client) {
        case 'desktop':
            return '🖥️';
        case 'mobile':
            return '📱';
        case 'web':
            return '🌐';
        default:
            return '❔';
    }
}

export { PresenceActivitiesByGuildId, PresenceActivityDocumentWithSeconds, VoiceActivitiesByChannelId, VoiceActivityDocumentWithSeconds, checkGuildVoiceEmpty, clientStatusToEmoji, endPresenceActivity, endVoiceActivity, formatLastActivityDetails, getLastUserPresenceActivity, getLastUserVoiceActivity, getLastVoiceActivity, getPresenceActivitiesByGuildId, getPresenceActivity, getPresenceClientStatus, getUserClients, getUserLastActivityDetails, getUserVoiceActivityStreak, getVoiceActivitiesByChannelId, getVoiceActivity, pruneActivities, startPresenceActivity, startVoiceActivity, validatePresenceActivities, validateVoiceActivities, voiceActivityModel };
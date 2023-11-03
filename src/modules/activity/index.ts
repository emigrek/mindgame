import { ClientPresenceStatusData, Guild, GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";

import voiceActivitySchema, { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import presenceActivitySchema, { PresenceActivityDocument } from "@/modules/schemas/PresenceActivity";

import mongoose, { Document } from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "@/modules/user";
import { Guild as DatabaseGuild, PresenceActivity, User as DatabaseUser, VoiceActivity } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import config from "@/utils/config";
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
            exp: parseInt(config.dailyReward)
        });

        client.emit("userRecievedDailyReward", member.user, member.guild, moment().add(1, "days").unix());
        return true;
    }

    if (!userLastVoiceActivity.to) return false;

    const last = userLastVoiceActivity.to.getTime();
    const now = new Date().getTime();
    const diff = Math.abs(now - last);
    const diffDays = diff / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
        return false;
    }

    await updateUserStatistics(client, member.user, {
        exp: parseInt(config.dailyReward)
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

    const last = activity.to.getTime();
    const now = new Date().getTime();
    const diff = Math.abs(now - last);
    const diffHours = diff / (1000 * 60 * 60);

    if (diffHours < 8) {
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

    const duration = moment(exists.to).diff(moment(exists.from), "seconds");
    const expGained = Math.round(
        duration * 0.0063817
    );

    const user = await client.users.fetch(userId);

    await updateUserStatistics(client, user, {
        exp: expGained,
        time: {
            presence: duration
        }
    });

    return exists;
}

const endVoiceActivity = async (client: ExtendedClient, member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const exists = await getVoiceActivity(member);
    if (!exists) return null;

    exists.to = moment().toDate();
    await exists.save();

    const seconds = moment(exists.to).diff(moment(exists.from), "seconds");
    const hours = moment(exists.to).diff(moment(exists.from), "hours", true);

    const intersecting = await getChannelIntersectingVoiceActivities(exists)
        .then((activities) => activities.length);

    const base = seconds * 0.16;
    const boost = hours < 1 ? 1 : hours ** 2;

    const income = Math.round(
        base * boost * (intersecting + 1)
    );

    const sourceGuild = await getGuild(member.guild);
    if (!sourceGuild) return exists;

    await updateUserStatistics(client, member.user, {
        exp: income,
        time: {
            voice: seconds
        }
    }, sourceGuild);

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

interface ActivityPeakHour {
    hour: number;
    activePeak: number;
}

interface ActivityPeakDay {
    day: number;
    activePeak: number;
    hours: ActivityPeakHour[];
}

const getShortWeekDays = (locale: string, capitalize = true) => {
    moment.locale(locale);
    const days = moment.weekdaysShort();
    moment.locale('pl-PL');

    if (capitalize)
        return days.map(d => d.toUpperCase());
    else
        return days;
}

const mockDays = (): ActivityPeakDay[] => {
    const data = new Array(7).fill(null).map((_, i) => ({ day: i, activePeak: 0, hours: new Array(24).fill(null).map((_, j) => ({ hour: j, activePeak: 0 })) }));
    return data;
};

const getActivePeaks = async (activities: (VoiceActivity & Document)[] | (PresenceActivity & Document)[]) => {
    const data = mockDays();

    data.forEach((d: ActivityPeakDay) => {
        d.hours.forEach((h: ActivityPeakHour) => {
            const active = [...activities].filter(a => {
                const from = moment(a.from);
                const to = a.to ? moment(a.to) : moment();
                const hourCondition = from.hour() <= h.hour && to.hour() >= h.hour;
                const dayCondition = from.day() <= d.day && to.day() >= d.day;
                const minutesCondition = to.diff(from, "minutes") >= 10;
                return hourCondition && dayCondition && minutesCondition;
            }).length;

            if (active > h.activePeak)
                h.activePeak = active;
            if (active > d.activePeak)
                d.activePeak = active;
        });
    });

    return data;
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

const getChannelIntersectingVoiceActivities = async (activity: VoiceActivityDocument): Promise<VoiceActivityDocument[]> => {
    const activities = await voiceActivityModel.find({
        guildId: activity.guildId,
        channelId: activity.channelId,
        userId: {
            $ne: activity.userId
        },
        from: {
            $lte: activity.to
        },
        $or: [
            { to: null },
            { to: { $gte: activity.from } }
        ]
    });

    return activities;
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
            $project: {
                guildId: 1,
                channelId: 1,
                to: 1,
                from: 1,
            },
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
            $project: {
                guildId: 1,
                client: 1,
                to: 1,
                from: 1
            },
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
            return '💻';
        case 'mobile':
            return '📱';
        case 'web':
            return '🌐';
        default:
            return '❔';
    }
}

export { formatLastActivityDetails, clientStatusToEmoji, getUserLastActivityDetails, getLastUserPresenceActivity, getLastUserVoiceActivity, getChannelIntersectingVoiceActivities, getLastVoiceActivity, getPresenceClientStatus, checkGuildVoiceEmpty, startVoiceActivity, getGuildActiveVoiceActivities, getActivePeaks, getShortWeekDays, ActivityPeakDay, getUserPresenceActivity, getVoiceActivityBetween, getPresenceActivityBetween, getPresenceActivityColor, getUserVoiceActivity, startPresenceActivity, ActivityPeakHour, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, voiceActivityModel, validateVoiceActivities, validatePresenceActivities };
import { Guild, GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema, { VoiceActivityDocument } from "../schemas/VoiceActivity";
import presenceActivitySchema, { PresenceActivityDocument } from "../schemas/PresenceActivity";

import mongoose, { Document } from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "../user";
import { Guild as DatabaseGuild, PresenceActivity, User as DatabaseUser, VoiceActivity } from "../../interfaces";
import { getGuild } from "../guild";
import config from "../../utils/config";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const checkForDailyReward = async (client: ExtendedClient, member: GuildMember) => {
    const userLastVoiceActivity = await voiceActivityModel.findOne({
        userId: member.id,
        guildId: member.guild.id,
        to: { $ne: null }
    }).sort({ to: -1 }).limit(1);

    if(!userLastVoiceActivity) return false;

    const last = userLastVoiceActivity.to!.getTime();
    const now = new Date().getTime();
    const diff = Math.abs(now - last);
    const diffDays = diff/(1000*60*60*24);

    if(diffDays < 1) {
        return false;
    }

    await updateUserStatistics(client, member.user, {
        exp: parseInt(config.dailyReward)
    });

    await client.emit("userRecievedDailyReward", member.user, member.guild, moment().add(1, "days").unix());

    return true;
};

const checkLongVoiceBreak = async (client: ExtendedClient, member: GuildMember) => {
    const activity = await getLastVoiceActivity(member);
    if(!activity) return false;

    const last = activity.to!.getTime();
    const now = new Date().getTime();
    const diff = Math.abs(now - last);
    const diffHours = diff/(1000*60*60);

    if(diffHours < 8) {
        return false;
    }
    
    await client.emit("userBackFromLongVoiceBreak", member);
    return true;
};

const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel): Promise<VoiceActivityDocument | null> => {
    if(
        member.user.bot ||
        channel.equals(member.guild.afkChannel!)
    ) return null;

    const exists = await getVoiceActivity(member);
    if(exists) return null;

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

const startPresenceActivity = async (client: ExtendedClient, member: GuildMember, presence: Presence): Promise<PresenceActivityDocument | null> => {
    if(member.user.bot) return null;
    
    const exists = await getPresenceActivity(member);
    if(exists) return null;

    const newPresenceActivity = new presenceActivityModel({
        userId: member.id,
        guildId: member.guild.id,
        from: moment().toDate(),
        status: presence.status,
        clientStatus: presence.clientStatus
    });

    await newPresenceActivity.save();
    return newPresenceActivity;
};

const endPresenceActivity = async (client: ExtendedClient, member: GuildMember): Promise<PresenceActivityDocument | null> => {
    const exists = await getPresenceActivity(member);
    if(!exists) return null;

    exists.to = moment().toDate();
    const duration = moment(exists.to).diff(moment(exists.from), "seconds");
    if(duration < 60) {
        await exists.delete();
        return exists;
    }

    await exists.save();

    
    const expGained = Math.round(
        duration * 0.0063817
    );

    await updateUserStatistics(client, member.user, {
        exp: expGained,
        time: {
            presence: duration
        }
    });

    return exists;
}

const endVoiceActivity = async (client: ExtendedClient, member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const exists = await getVoiceActivity(member);
    if(!exists) return null;

    exists.to = moment().toDate();
    await exists.save();

    const seconds = moment(exists.to).diff(moment(exists.from), "seconds");
    const hours = moment(exists.to).diff(moment(exists.from), "hours", true);

    const base = seconds * 0.16;
    const boost = hours < 1 ? 1 : hours**2;
    
    const income = Math.round(
        base * boost
    );

    const sourceGuild = await getGuild(member.guild);
    await updateUserStatistics(client, member.user, {
        exp: income,
        time: {
            voice: seconds
        }
    }, sourceGuild!);

    return exists;
}

const validateVoiceActivities = async (client: ExtendedClient) => {
    const activities = await voiceActivityModel.find({
        to: null
    });

    console.log(`[Activity] Validating ${activities.length} voice activities...`);
    const outOfSync: string[] = [];
    for await(const activity of activities) {
        const guild = client.guilds.cache.get(activity.guildId);
        if(!guild) continue;

        const member = guild.members.cache.get(activity.userId);
        if(!member) continue;

        const channel = client.channels.cache.get(activity.channelId) as VoiceBasedChannel;
        if(!channel) {
            outOfSync.push(activity.userId);
            await endVoiceActivity(client, member);
            continue;
        }

        if(!member.voice?.channelId || !member.voice?.channel) {
            outOfSync.push(activity.userId);
            await endVoiceActivity(client, member);
            continue;
        }

        if(!member.voice.channel.equals(channel)) {
            outOfSync.push(activity.userId);
            await endVoiceActivity(client, member);
            await startVoiceActivity(client, member, member.voice.channel);
            continue;
        }
    }

    console.log(`[Activity] ${outOfSync.length} voice activities were out of sync.`);
};

const validatePresenceActivities = async (client: ExtendedClient) => {
    const activities = await presenceActivityModel.find({
        to: null
    });

    console.log(`[Activity] Validating ${activities.length} presence activities...`);
    const outOfSync: string[] = [];
    for await(const activity of activities) {
        const guild = client.guilds.cache.get(activity.guildId);
        if(!guild) continue;

        const member = guild.members.cache.get(activity.userId);
        if(!member) continue;

        const presence = member.presence;
        if(!presence) {
            outOfSync.push(activity.userId);
            await endPresenceActivity(client, member);
            continue;
        }

        if(presence.status !== activity.status) {
            outOfSync.push(activity.userId);
            await endPresenceActivity(client, member);
            await startPresenceActivity(client, member, presence);
            continue;
        }
    }

    console.log(`[Activity] ${outOfSync.length} presence activities were out of sync.`);
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

    if(capitalize)
        return days.map(d => d.toUpperCase());
    else
        return days;
}

const mockDays = (): ActivityPeakDay[] => {
    const data = new Array(7).fill(null).map((_, i) => ({day: i, activePeak: 0, hours: new Array(24).fill(null).map((_, j) => ({hour: j, activePeak: 0}))}));
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

            if(active > h.activePeak)
                h.activePeak = active;
            if(active > d.activePeak)
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

const getVoiceActivity = async (member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const exists = await voiceActivityModel.findOne({ userId: member.user.id, guildId: member.guild.id, to: null });
    return exists;
};

const getLastVoiceActivity = async (member: GuildMember): Promise<VoiceActivityDocument | null> => {
    const last = await voiceActivityModel.findOne({ userId: member.user.id, guildId: member.guild.id }).sort({ to: -1 });
    return last;
};

const getUserVoiceActivity = async (user: DatabaseUser): Promise<VoiceActivityDocument | null> => {
    const exists = await voiceActivityModel.findOne({ userId: user.userId, to: null });
    return exists;
}

const getPresenceActivity = async (member: GuildMember): Promise<PresenceActivityDocument | null> => {
    const exists = await presenceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    return exists;
}

const getUserPresenceActivity = async (user: DatabaseUser): Promise<PresenceActivityDocument | null> => {
    const exists = await presenceActivityModel.findOne({ userId: user.userId, to: null });
    return exists;
}

const getGuildActiveVoiceActivities = async (guild: Guild): Promise<VoiceActivityDocument[]> => {
    const activities = await voiceActivityModel.find({ guildId: guild.id, to: null });
    return activities;
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

    if(!activity) return '#68717e';
    const color = colors.find(c => c.name === activity.status);
    if(color) return color.color;
    return '#68717e';
}

export { getLastVoiceActivity, startVoiceActivity, getGuildActiveVoiceActivities, getActivePeaks, getShortWeekDays, ActivityPeakDay, getUserPresenceActivity, getVoiceActivityBetween, getPresenceActivityBetween, getPresenceActivityColor, getUserVoiceActivity, startPresenceActivity, ActivityPeakHour, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, voiceActivityModel, validateVoiceActivities, validatePresenceActivities };
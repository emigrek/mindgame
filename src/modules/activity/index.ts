import { Activity, ActivityType, Collection, GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema from "../schemas/VoiceActivity";
import presenceActivitySchema from "../schemas/PresenceActivity";

import mongoose, { Document } from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "../user";
import { Guild as DatabaseGuild, PresenceActivity, User as DatabaseUser, UserGuildActivityDetails, VoiceActivity } from "../../interfaces";
import { getGuild } from "../guild";

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

    await client.emit("userRecievedDailyReward", member.user, member.guild, moment().add(1, "days").unix());

    return true;
};

const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel) => {
    if(
        member.user.bot ||
        channel.equals(member.guild.afkChannel!)
    ) return;

    const exists = await getVoiceActivity(member);
    if(exists) return;

    await checkForDailyReward(client, member);

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

const startPresenceActivity = async (client: ExtendedClient, member: GuildMember, presence: Presence) => {
    if(member.user.bot) return;
    
    const exists = await getPresenceActivity(member);
    if(exists) return;

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

const endPresenceActivity = async (client: ExtendedClient, member: GuildMember) => {
    const exists = await getPresenceActivity(member);
    if(!exists) return;

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

const endVoiceActivity = async (client: ExtendedClient, member: GuildMember) => {
    const exists = await getVoiceActivity(member);
    if(!exists) return;

    exists.to = moment().toDate();
    await exists.save();

    const duration = moment(exists.to).diff(moment(exists.from), "seconds");
    const expGained = Math.round(
        duration * 0.16
    );

    const sourceGuild = await getGuild(member.guild);
    await updateUserStatistics(client, member.user, {
        exp: expGained,
        time: {
            voice: duration
        }
    }, sourceGuild!);

    return exists;
}

interface ActivityPeakHour {
    hour: number;
    activePeak: number;
};

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
    let data = mockDays();

    activities.forEach((activity: VoiceActivity & Document | PresenceActivity & Document) => {
        const fromDay = moment(activity.from).day();
        const toDay = activity.to ? moment(activity.to).day() : moment().day();
        const fromHour = moment(activity.from).hour();
        const toHour = activity.to ? moment(activity.to).hour() : moment().hour();
        
        for(let i = fromDay; i <= toDay; i++) {
            const day = data[i];
            for(let j = fromHour; j <= toHour; j++) {
                const simultenousActivities = [...activities].filter((a: VoiceActivity & Document | PresenceActivity & Document) => {
                    const aFromDay = moment(a.from).day();
                    const aToDay = a.to ? moment(a.to).day() : moment().day();
                    const aFromHour = moment(a.from).hour();
                    const aToHour = a.to ? moment(a.to).hour() : moment().hour();

                    return aFromDay <= i && aToDay >= i && aFromHour <= j && aToHour >= j;
                });

                if(simultenousActivities.length > day.hours[j].activePeak) {
                    day.hours[j].activePeak = simultenousActivities.length;
                }

                if(simultenousActivities.length > day.activePeak) {
                    day.activePeak = simultenousActivities.length;
                }
            }
        }
    });

    return data;
};

const getVoiceActivityBetween = async (guild: DatabaseGuild, startDate: Date, endDate: Date) => {
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

const getPresenceActivityBetween = async (guild: DatabaseGuild, startDate: Date, endDate: Date) => {
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

const getVoiceActivity = async (member: GuildMember) => {
    const exists = await voiceActivityModel.findOne({ userId: member.user.id, guildId: member.guild.id, to: null });
    return exists;
};

const getUserVoiceActivity = async (user: DatabaseUser) => {
    const exists = await voiceActivityModel.findOne({ userId: user.userId, to: null });
    return exists;
}

const getPresenceActivity = async (member: GuildMember) => {
    const exists = await presenceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    return exists;
}

const getUserPresenceActivity = async (user: DatabaseUser) => {
    const exists = await presenceActivityModel.findOne({ userId: user.userId, to: null });
    return exists;
}

const getPresenceActivityColor = (activity: PresenceActivity) => {
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

export { startVoiceActivity, getActivePeaks, getShortWeekDays, ActivityPeakDay, getUserPresenceActivity, getVoiceActivityBetween, getPresenceActivityBetween, getPresenceActivityColor, getUserVoiceActivity, startPresenceActivity, ActivityPeakHour, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, voiceActivityModel };
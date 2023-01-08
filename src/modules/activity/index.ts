import { Activity, ActivityType, Collection, GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema from "../schemas/VoiceActivity";
import presenceActivitySchema from "../schemas/PresenceActivity";

import mongoose from "mongoose";
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
    }).sort({ from: -1 }).limit(1);

    if(!userLastVoiceActivity) return;

    const lastVoiceActivityDate = moment(userLastVoiceActivity.from);
    const now = moment();
    const next = lastVoiceActivityDate.add(1, "days");

    const diff = now.diff(lastVoiceActivityDate, "days");
    if(diff >= 1) {
        await client.emit("userRecievedDailyReward", member.user, member.guild, next.unix());
    }
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

interface ActivityHour {
    hour: number;
    activePeak: number | null;
};

interface ActivityDay {
    day: number;
    activePeak: number | null;
    hours: Collection<string, ActivityHour>;
}

const mockDays = () => {
    let data: Collection<string, ActivityDay> = new Collection();
    for(let i = 0; i < 7; i++) {
        let hours: Collection<string, ActivityHour> = new Collection();
        for(let j = 0; j < 24; j++) {
            hours.set(j.toString(), {
                hour: j,
                activePeak: null
            });
        }
        data.set(i.toString(), {
            day: i,
            activePeak: null,
            hours
        });
    }
    return data;
};

const getActiveUsersInHour = (activities: VoiceActivity[] | PresenceActivity[], day: number, hour: number): number => {
    let activeUsers = new Set<string>();
    for (const activity of activities) {
        if(!activity.to) activity.to = moment().toDate();

        if (
            (activity.from.getHours() === hour && activity.from.getDay() === day) ||
            (activity.to.getHours() === hour && activity.to.getDay() === day)
        ) {
            activeUsers.add(activity.userId);
        }
    }
    return activeUsers.size;
}

const getActiveUsersInDay = (activities: VoiceActivity[] | PresenceActivity[], day: number): number => {
    let activeUsers = new Set<string>();
    for (const activity of activities) {
        if(!activity.to) activity.to = moment().toDate();

        if (
            activity.from.getDay() === day || 
            activity.to.getDay() === day
        ) {
            activeUsers.add(activity.userId);
        }
    }
    return activeUsers.size;
}

const getGuildPresenceActivityInHoursAcrossWeek = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").add(1, 'hour').toDate();
    const endWeek = moment().endOf("week").add(1, 'hour').toDate();

    const query = await presenceActivityModel.find({
        guildId: guild.guildId,
        from: {
            $gte: startWeek,
            $lte: endWeek
        },
        $or: [
            { to: { $eq: null } },
            { to: { $lte: endWeek } }
        ]
    });

    let data: Collection<string, ActivityDay> = mockDays();

    query.forEach((activity: PresenceActivity) => {
        if(!activity.to) {
            activity.to = moment().toDate();
        }

        const activityDay = moment(activity.to).day();
        const activityHour = moment(activity.to).hour();

        const day = data.get(activityDay.toString());
        if(!day) return;

        day.activePeak = getActiveUsersInDay(query, day.day);

        const hour = day.hours.get(activityHour.toString());
        if(hour) {
            hour.activePeak = getActiveUsersInHour(query, day.day, activityHour);
        }
    });

    return data;
}

const getGuildVoiceActivityInHoursAcrossWeek = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").add(1, 'hour').toDate();
    const endWeek = moment().endOf("week").add(1, 'hour').toDate();

    const query = await voiceActivityModel.find({
        guildId: guild.guildId,
        from: {
            $gte: startWeek,
            $lte: endWeek
        },
        $or: [
            { to: { $eq: null } },
            { to: { $lte: endWeek } }
        ]
    });

    let data: Collection<string, ActivityDay> = mockDays();

    query.forEach(async (activity: VoiceActivity) => {
        if(!activity.to) {
            activity.to = moment().toDate();
        }
        const activityDay = moment(activity.to).day();
        const activityHour = moment(activity.to).hour();  

        const day = data.get(activityDay.toString());
        if(!day) return;

        day.activePeak = await getActiveUsersInDay(query, day.day);

        const hour = day.hours.get(activityHour.toString());
        if(hour) {
            hour.activePeak = getActiveUsersInHour(query, day.day, activityHour);
        }
    });

    return data;
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

export { startVoiceActivity, getUserPresenceActivity, getUserVoiceActivity, getGuildPresenceActivityInHoursAcrossWeek,  getGuildVoiceActivityInHoursAcrossWeek, startPresenceActivity, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, voiceActivityModel };
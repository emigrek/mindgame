import { Activity, ActivityType, Collection, GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema from "../schemas/VoiceActivity";
import presenceActivitySchema from "../schemas/PresenceActivity";

import mongoose from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "../user";
import { Guild as DatabaseGuild, PresenceActivity, User as DatabaseUser, UserGuildActivityDetails, VoiceActivity } from "../../interfaces";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const checkForDailyReward = async (client: ExtendedClient, member: GuildMember) => {
    const userLastVoiceActivity = await voiceActivityModel.findOne({
        userId: member.id,
        guildId: member.guild.id
    }).sort({ to: -1 });

    if(!userLastVoiceActivity) return;

    const lastVoiceActivityDate = moment(userLastVoiceActivity.to);
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
    await exists.save();

    const duration = moment(exists.to).diff(moment(exists.from), "seconds");
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


    await updateUserStatistics(client, member.user, {
        exp: expGained,
        time: {
            voice: duration
        }
    });

    return exists;
}

const getUserGuildsActivityDetails = async (sourceUser: DatabaseUser) => {
    const allDetails: Collection<string, UserGuildActivityDetails> = new Collection();

    const voiceActivites = await voiceActivityModel.find({
        userId: sourceUser.userId
    });

    for(const voiceActivity of voiceActivites) {
        let duration = moment(voiceActivity.to).diff(moment(voiceActivity.from), "seconds");
        if(!voiceActivity.to) duration = moment().diff(moment(voiceActivity.from), "seconds");

        if(allDetails.has(voiceActivity.guildId)) {
            allDetails.get(voiceActivity.guildId)!.time.voice += duration;
        } else {
            allDetails.set(voiceActivity.guildId, {
                guildId: voiceActivity.guildId,
                userId: voiceActivity.userId,
                time: {
                    voice: duration
                }
            });
        }
    }

    return allDetails;
}

const getFavoriteGuildDetails = async (sourceUser: DatabaseUser) => {
    const details = await getUserGuildsActivityDetails(sourceUser);
    if(!details.size) return null;
    const sorted = details.sort((a, b) => b.time.voice - a.time.voice);
    return sorted.first();
};

interface ActivityHour {
    hour: number;
    activePeak: number;
};

interface ActivityDay {
    day: number;
    activePeak: number;
    hours: ActivityHour[];
}

const mockDays = () => {
    const data: Collection<string, ActivityDay> = new Collection();
    for(let i = 0; i < 7; i++) {
        const hours: ActivityHour[] = [];
        for(let j = 0; j < 24; j++) {
            hours.push({
                hour: j,
                activePeak: 0
            });
        }
        data.set(i.toString(), {
            day: i,
            activePeak: 0,
            hours
        });
    }
    return data;
};

const getActiveUsersInHour = (voiceActivities: VoiceActivity[] | PresenceActivity[], day: number, hour: number): number => {
    const activeUsers = new Set<string>();
    for (const activity of voiceActivities) {
        // Check if the activity started within the desired hour
        if (activity.from.getHours() === hour && activity.from.getDay() === day) {
            activeUsers.add(activity.userId);
            continue;
        }
        // Check if the activity ended within the desired hour
        if (activity.to && activity.to.getHours() === hour && activity.to.getDay() === day) {
            activeUsers.add(activity.userId);
        }
    }
    return activeUsers.size;
}

const getActiveUsersInDay = (voiceActivities: VoiceActivity[] | PresenceActivity[], day: number): number => {
    const activeUsers = new Set<string>();
    for (const activity of voiceActivities) {
        if(!activity.to) activity.to = moment().toDate();

        if (activity.from.getDay() === day || activity.to.getDay() === day) {
            activeUsers.add(activity.userId);
        }
    }
    return activeUsers.size;
}

const getGuildPresenceActivityInHoursAcrossWeek = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").toDate();
    const endWeek = moment().endOf("week").toDate();
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

        const hour = day.hours.find(h => h.hour === activityHour);
        if(hour) {
            hour.activePeak = getActiveUsersInHour(query, activityHour, day.day);
        }
    });

    return data;
}

const getGuildVoicePeak = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").toDate();
    const endWeek = moment().endOf("week").toDate();

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

    let activeUsersPeak = 0;

    query.forEach((activity: VoiceActivity) => {
        if(!activity.to) {
            activity.to = moment().toDate();
        }
        
        const activityDay = moment(activity.to).day();
        const activityHour = moment(activity.to).hour();

        const activeUsers = getActiveUsersInHour(query, activityHour, activityDay);
        if(activeUsers > activeUsersPeak) {
            activeUsersPeak = activeUsers;
        }
    });

    return activeUsersPeak;
}

const getGuildPresencePeak = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").toDate();
    const endWeek = moment().endOf("week").toDate();

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

    let activeUsersPeak = 0;

    query.forEach((activity: PresenceActivity) => {
        if(!activity.to) {
            activity.to = moment().toDate();
        }
        const activityDay = moment(activity.to).day();
        const activityHour = moment(activity.to).hour();

        const activeUsers = getActiveUsersInHour(query, activityHour, activityDay);
        if(activeUsers > activeUsersPeak) {
            activeUsersPeak = activeUsers;
        }
    });

    return activeUsersPeak;
}

const getGuildVoiceActivityInHoursAcrossWeek = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").toDate();
    const endWeek = moment().endOf("week").toDate();

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

        const hour = day.hours.find(h => h.hour === activityHour);
        if(hour) {
            hour.activePeak = getActiveUsersInHour(query, activityHour, day.day);
        }
    });

    return data;
}

const getGuildMostVoiceActiveUserAcrossWeek = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").toDate();
    const endWeek = moment().endOf("week").toDate();
    const query = await voiceActivityModel.aggregate([
        {
          $match: {
            guildId: guild.guildId,
            from: { $gte: startWeek },
            to: { $lte: endWeek }
          }
        },
        {
          $group: {
            _id: "$userId",
            time: {
              $sum: {
                $divide: [{ $subtract: ["$to", "$from"] }, 1000]
              }
            }
          }
        },
        {
          $sort: {
            time: -1
          }
        },
        {
          $limit: 1
        }
    ])

    return query[0];
};

const getGuildMostPresenceActiveUserAcrossWeek = async (guild: DatabaseGuild) => {
    const startWeek = moment().startOf("week").toDate();
    const endWeek = moment().endOf("week").toDate();
    const query = await presenceActivityModel.aggregate([
        {
          $match: {
            guildId: guild.guildId,
            from: { $gte: startWeek },
            to: { $lte: endWeek }
          }
        },
        {
          $group: {
            _id: "$userId",
            time: {
              $sum: {
                $divide: [{ $subtract: ["$to", "$from"] }, 1000]
              }
            }
          }
        },
        {
          $sort: {
            time: -1
          }
        },
        {
          $limit: 1
        }
    ])

    return query[0];
};

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

export { startVoiceActivity, getUserPresenceActivity, getUserVoiceActivity, getGuildVoicePeak, getGuildPresencePeak, getGuildPresenceActivityInHoursAcrossWeek,  getGuildVoiceActivityInHoursAcrossWeek, getGuildMostVoiceActiveUserAcrossWeek, getGuildMostPresenceActiveUserAcrossWeek, startPresenceActivity, getFavoriteGuildDetails, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, getUserGuildsActivityDetails, voiceActivityModel };
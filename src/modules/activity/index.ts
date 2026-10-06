import ExtendedClient from "@/client/ExtendedClient";
import { ClientPresenceStatusData, Guild, GuildMember, PartialGuildMember, Presence, VoiceBasedChannel } from "discord.js";

import presenceActivitySchema, { PresenceActivityDocument } from "@/modules/schemas/PresenceActivity";
import voiceActivitySchema, { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";

import i18n from "@/client/i18n";
import { config } from "@/config";
import { ActivityStreak } from "@/interfaces";
import { updateUserGuildStatistics } from "@/modules/user-guild-statistics";
import { getWarsawDay } from "@/utils/date";
import moment from "moment";
import mongoose from "mongoose";
import { computeStreaks } from "./streak";

const isDuplicateKeyError = (e: unknown) => (e as { code?: number })?.code === 11000;

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const checkVoiceActivityRewards = async (client: ExtendedClient, member: GuildMember) => {
    // The last finished session; the one just started is still open
    const activity = await getUserLastGuildVoiceActivity(member.user.id, member.guild.id);

    // One reward per Warsaw calendar day ("YYYY-MM-DD" keys compare as strings)
    if (activity && getWarsawDay(activity.from) >= getWarsawDay(new Date()))
        return;

    // Computed only when a reward is due: it reads every voice day of the member
    const streak = await getUserVoiceActivityStreak(member.user.id, member.guild.id);
    // The very first session gets the daily reward only
    const significant = !!activity && streak.isSignificant;

    await updateUserGuildStatistics({
        client,
        userId: member.user.id,
        guildId: member.guild.id,
        update: {
            exp: config.experience.voice.dailyActivityReward + (significant ? config.experience.voice.significantActivityStreakReward : 0)
        }
    });

    client.emit("userReceivedDailyReward", member.user.id, member.guild.id, streak);
    if (significant) client.emit("userSignificantVoiceActivityStreak", member, streak);
};

// Followers are notified about a break across all guilds (follows are global)
const checkLongVoiceBreak = async (client: ExtendedClient, member: GuildMember) => {
    // Finished sessions only: the session just opened would otherwise end the search
    const activity = await voiceActivityModel.findOne({ userId: member.user.id, to: { $ne: null } }).sort({ to: -1 });
    if (!activity?.to) {
        client.emit("userBackFromLongVoiceBreak", member);
        return true;
    }

    const breakMs = moment().diff(moment(activity.to));
    if (breakMs < config.userLongBreakHours * 60 * 60 * 1000) {
        return false;
    }

    client.emit("userBackFromLongVoiceBreak", member, breakMs);
    return true;
};

const checkGuildVoiceEmpty = async (client: ExtendedClient, guild: Guild, channel: VoiceBasedChannel) => {
    const activeVoiceActivities = await getGuildActiveVoiceActivities(guild.id);
    if (activeVoiceActivities.length) return;

    client.emit("guildVoiceEmpty", guild.id, channel);
};

// `from` defaults to now; voiceChannelJoin passes the time it received the event, because Coordinated Action
// compares join times in fractions of a second and the awaits below used to delay the timestamp
const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel, from: Date = new Date()): Promise<VoiceActivityDocument | null> => {
    if (
        member.user.bot ||
        member.guild.afkChannel && channel.equals(member.guild.afkChannel)
    ) return null;

    const exists = await getVoiceActivity({ userId: member.id, guildId: member.guild.id });
    if (exists) return null;

    const newVoiceActivity = new voiceActivityModel({
        userId: member.id,
        channelId: channel.id,
        voiceStateId: member.voice?.id,
        guildId: member.guild.id,
        streaming: member.voice?.streaming,
        from
    });
    // A concurrent event opened the session first (unique index on open sessions)
    const saved = await newVoiceActivity.save().then(() => true, (e) => {
        if (isDuplicateKeyError(e)) return false;
        throw e;
    });
    if (!saved) return null;

    // After the save, so only the event that opened the session runs these. The open session is skipped
    // by both: the last session is looked up by `to` (open sorts last) and rewards look at finished ones.
    await checkLongVoiceBreak(client, member);
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

    try {
        await newPresenceActivity.save();
        return newPresenceActivity;
    } catch (e) {
        // Presence updates come in bursts (desktop <-> mobile); a concurrent one opened the session first
        const existing = isDuplicateKeyError(e) ? await getPresenceActivity(userId, guildId) : null;
        if (!existing) throw e;
        return existing;
    }
};

const endPresenceActivity = async (userId: string, guildId: string): Promise<PresenceActivityDocument | null> => {
    const exists = await getPresenceActivity(userId, guildId);
    if (!exists) return null;

    exists.to = moment().toDate();
    await exists.save();

    return exists;
}

const endVoiceActivity = async (member: GuildMember | PartialGuildMember): Promise<VoiceActivityDocument | null> => {
    const exists = await getVoiceActivity({ userId: member.id, guildId: member.guild.id });
    if (!exists) return null;

    exists.to = moment().toDate();
    await exists.save();

    return exists;
}

// Sessions that ended while the bot was offline are closed at the last minute the bot saw them (lastSeenAt, refreshed
// by every experience tick) instead of being deleted: the day still counts for streaks and the session for Host and
// Marathon, without crediting the downtime. Older sessions without a heartbeat close at their start.
const closeAtLastSeen = async <T extends VoiceActivityDocument | PresenceActivityDocument>(activity: T): Promise<T> => {
    activity.to = activity.lastSeenAt ?? activity.from;
    await activity.save();
    return activity;
};

const validateVoiceActivities = async (client: ExtendedClient) => {
    const activities = await voiceActivityModel.find({
        to: null
    });

    const outOfSync: string[] = [];
    const closed: VoiceActivityDocument[] = [];
    for await (const activity of activities) {
        const { userId, guildId, channelId } = activity;
        const guild = await client.guilds.fetch(guildId)
            .catch(() => null);
        // The bot is no longer in this guild
        if (!guild) {
            outOfSync.push(userId);
            closed.push(await closeAtLastSeen(activity));
            continue;
        }

        const member = await guild.members.fetch(userId)
            .catch(() => null);
        if (!member) {
            outOfSync.push(userId);
            closed.push(await closeAtLastSeen(activity));
            continue;
        }
        
        const channel = client.channels.cache.get(channelId) as VoiceBasedChannel;
        if (!channel) {
            outOfSync.push(userId);
            closed.push(await closeAtLastSeen(activity));
            continue;
        }

        if (!member.voice?.channelId || !member.voice?.channel) {
            outOfSync.push(userId);
            closed.push(await closeAtLastSeen(activity));
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
            closed.push(await closeAtLastSeen(activity));
        }
    }

    return { outOfSync, closed };
};

// ponytail: leave events can be missed (channel deleted, gateway reconnect, join/leave race), so trust the voice state cache
const isMemberInVoice = (client: ExtendedClient, userId: string, guildId: string) => {
    const guild = client.guilds.cache.get(guildId);
    const state = guild?.voiceStates.cache.get(userId);
    return !!state?.channelId && state.channelId !== guild?.afkChannelId && !state.deaf;
};

// Returns the sessions still open and the ones it closed, which still count for Night Owl and Marathon
const closeStaleVoiceActivities = async (client: ExtendedClient, groups: VoiceActivitiesByChannelId[]): Promise<{ active: VoiceActivitiesByChannelId[]; closed: VoiceActivityDocument[] }> => {
    const stale = groups
        .flatMap(({ activities }) => activities)
        .filter(({ userId, guildId }) => !isMemberInVoice(client, userId, guildId));

    if (!stale.length) return { active: groups, closed: [] };

    const to = moment().toDate();
    await voiceActivityModel.updateMany({ _id: { $in: stale.map(({ _id }) => _id) } }, { to });

    const staleIds = new Set(stale.map(({ _id }) => String(_id)));
    return {
        active: groups
            .map(group => ({ ...group, activities: group.activities.filter(({ _id }) => !staleIds.has(String(_id))) }))
            .filter(group => group.activities.length),
        // Plain aggregate rows: Night Owl and Marathon only read from and to
        closed: stale.map(activity => ({ ...activity, to }) as unknown as VoiceActivityDocument),
    };
};

// Heartbeat of open sessions, see closeAtLastSeen
const touchActivities = async (voice: VoiceActivitiesByChannelId[], presence: PresenceActivitiesByGuildId[]) => {
    const lastSeenAt = moment().toDate();
    const ids = (groups: { activities: { _id: unknown }[] }[]) => groups.flatMap(({ activities }) => activities.map(({ _id }) => _id));
    await Promise.all([
        voiceActivityModel.updateMany({ _id: { $in: ids(voice) } }, { lastSeenAt }),
        presenceActivityModel.updateMany({ _id: { $in: ids(presence) } }, { lastSeenAt }),
    ]);
};

// Members in voice or online without an open session (joined during downtime, or lost a join/leave race)
// used to earn nothing until their next join or status change
const openMissingActivities = async (client: ExtendedClient, voice: VoiceActivitiesByChannelId[], presence: PresenceActivitiesByGuildId[]) => {
    const key = ({ guildId, userId }: { guildId: string; userId: string }) => `${guildId}:${userId}`;
    const openVoice = new Set(voice.flatMap(({ activities }) => activities).map(key));
    const openPresence = new Set(presence.flatMap(({ activities }) => activities).map(key));

    for (const guild of client.guilds.cache.values()) {
        for (const state of guild.voiceStates.cache.values()) {
            const { member, channel } = state;
            if (!member || !channel || member.user.bot || !isMemberInVoice(client, state.id, guild.id)) continue;
            if (!openVoice.has(key({ guildId: guild.id, userId: state.id })))
                await startVoiceActivity(client, member, channel);
        }
        for (const memberPresence of guild.presences.cache.values()) {
            if (!memberPresence.member || memberPresence.member.user.bot || memberPresence.status === "offline") continue;
            if (!openPresence.has(key({ guildId: guild.id, userId: memberPresence.userId })))
                await startPresenceActivity(memberPresence.userId, guild.id, memberPresence);
        }
    }
};

// Offline events can be missed just like voice leaves (gateway reconnect, bot removed from the guild).
// With the GuildPresences intent the cache holds every non-offline member.
const isMemberPresent = (client: ExtendedClient, userId: string, guildId: string) => {
    const status = client.guilds.cache.get(guildId)?.presences.cache.get(userId)?.status;
    return !!status && status !== "offline";
};

const closeStalePresenceActivities = async (client: ExtendedClient, groups: PresenceActivitiesByGuildId[]): Promise<PresenceActivitiesByGuildId[]> => {
    const staleIds = groups
        .flatMap(({ activities }) => activities)
        .filter(({ userId, guildId }) => !isMemberPresent(client, userId, guildId))
        .map(({ _id }) => _id);

    if (!staleIds.length) return groups;

    await presenceActivityModel.updateMany({ _id: { $in: staleIds } }, { to: moment().toDate() });

    const stale = new Set(staleIds.map(String));
    return groups
        .map(group => ({ ...group, activities: group.activities.filter(({ _id }) => !stale.has(String(_id))) }))
        .filter(group => group.activities.length);
};

// The bot left or was removed from the guild
const endGuildActivities = async (guildId: string) => {
    const to = moment().toDate();
    await Promise.all([
        voiceActivityModel.updateMany({ guildId, to: null }, { to }),
        presenceActivityModel.updateMany({ guildId, to: null }, { to }),
    ]);
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
        // The bot is no longer in this guild
        if (!guild) {
            outOfSync.push(userId);
            await closeAtLastSeen(activity);
            continue;
        }

        const member = await guild.members.fetch(userId)
            .catch(() => null);
        if (!member) {
            outOfSync.push(userId);
            await closeAtLastSeen(activity);
            continue;
        }

        const presence = member.presence;
        if (!presence) {
            outOfSync.push(userId);
            await closeAtLastSeen(activity);
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

const getPresenceClientStatus = (clientStatus?: ClientPresenceStatusData | null): string => {
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
    return voiceActivityModel.findOne({ userId, guildId, to: null });
};

// Time since the member's last finished session in this guild, for Comeback (counted per guild)
const getGuildVoiceBreakMs = async (userId: string, guildId: string): Promise<number | null> => {
    const last = await voiceActivityModel.findOne({ userId, guildId, to: { $ne: null } }).sort({ to: -1 });
    return last?.to ? Date.now() - last.to.getTime() : null;
};

const getLastVoiceActivity = async (userId: string): Promise<VoiceActivityDocument | null> => {
    return voiceActivityModel.findOne({ userId }).sort({ to: -1 });
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
    return presenceActivityModel.findOne({ userId: userId, guildId: guildId, to: null });
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
    return voiceActivityModel.aggregate([
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
}

const getPresenceActivitiesByGuildId = async (): Promise<PresenceActivitiesByGuildId[]> => {
    return presenceActivityModel.aggregate([
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
}

const getUserClientsTime = async (userId: string): Promise<PresenceActivityDocumentWithSeconds[]> => {
    return presenceActivityModel.aggregate([
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
}

const getUserVoiceActivityStreak = async (userId: string, guildId: string): Promise<ActivityStreak> => {
    // Distinct Warsaw days with a voice session, grouped in Mongo instead of loading every session
    const days = await voiceActivityModel.aggregate<{ _id: string }>([
        { $match: { userId, guildId } },
        { $group: { _id: { $dateToString: { date: "$from", format: "%Y-%m-%d", timezone: "Europe/Warsaw" } } } },
        { $sort: { _id: 1 } },
    ]);

    const { streak, maxStreak } = computeStreaks(days.map(day => day._id), getWarsawDay(new Date()));
    return config.voiceActivityStreakLogic({ streak, maxStreak });
};


const getUserLastGuildVoiceActivity = async (userId: string, guildId: string): Promise<VoiceActivityDocument | undefined> => {
    const query = await voiceActivityModel.aggregate([
        {
            $match: {
                userId,
                guildId,
                to: { $ne: null }
            }
        },
        {
            $sort: {
                from: -1
            }
        },
        {
            $limit: 1
        }
    ]);
    return query.at(0);
};

const getLastChannelVoiceActivity = async (userId: string, channelId: string): Promise<VoiceActivityDocument | undefined> => {
    const query = await voiceActivityModel.aggregate([
        {
            $match: {
                userId: {
                    $ne: userId
                },
                channelId,
                to: null
            }
        },
        {
            $sort: {
                from: -1
            }
        },
        {
            $limit: 1
        }
    ]);
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

    return `\n${voice}\n${presence}`;
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
        clients.set(client, (clients.get(client) ?? 0) + activity.seconds);
    }

    const sorted = Array.from(clients).sort((a, b) => b[1] - a[1]);
    return {
        clients: sorted.map(([client]) => client),
        mostUsed: sorted[0] ? sorted[0][0] : undefined
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

export { PresenceActivitiesByGuildId, PresenceActivityDocumentWithSeconds, VoiceActivitiesByChannelId, VoiceActivityDocumentWithSeconds, checkGuildVoiceEmpty, clientStatusToEmoji, closeStalePresenceActivities, closeStaleVoiceActivities, endGuildActivities, endPresenceActivity, openMissingActivities, touchActivities, endVoiceActivity, formatLastActivityDetails, getLastChannelVoiceActivity, getLastUserPresenceActivity, getGuildVoiceBreakMs, getLastUserVoiceActivity, getLastVoiceActivity, getPresenceActivitiesByGuildId, getPresenceActivity, getPresenceClientStatus, getUserClients, getUserLastActivityDetails, getUserVoiceActivityStreak, getVoiceActivitiesByChannelId, getVoiceActivity, startPresenceActivity, startVoiceActivity, validatePresenceActivities, validateVoiceActivities, voiceActivityModel };


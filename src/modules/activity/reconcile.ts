import ExtendedClient from "@/client/ExtendedClient";
import { VoiceBasedChannel } from "discord.js";

import { PresenceActivityDocument } from "@/modules/schemas/PresenceActivity";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";

import moment from "moment";
import { voiceActivityModel, presenceActivityModel } from "./models";
import { startVoiceActivity, startPresenceActivity } from "./sessions";
import { VoiceActivitiesByChannelId, PresenceActivitiesByGuildId } from "./queries";
import { getPresenceClientStatus } from "./clients";

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

export { validateVoiceActivities, closeStaleVoiceActivities, touchActivities, openMissingActivities, closeStalePresenceActivities, validatePresenceActivities };

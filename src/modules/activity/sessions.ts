import ExtendedClient from "@/client/ExtendedClient";
import { Guild, GuildMember, PartialGuildMember, Presence, VoiceBasedChannel } from "discord.js";

import { PresenceActivityDocument } from "@/modules/schemas/PresenceActivity";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";

import { config } from "@/config";
import { updateUserGuildStatistics } from "@/modules/user-guild-statistics";
import { getWarsawDay } from "@/utils/date";
import moment from "moment";
import { isDuplicateKeyError, voiceActivityModel, presenceActivityModel } from "./models";
import { getVoiceActivity, getPresenceActivity, getUserVoiceActivityStreak, getUserLastGuildVoiceActivity, getGuildActiveVoiceActivities } from "./queries";
import { getPresenceClientStatus } from "./clients";

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
// The bot left or was removed from the guild
const endGuildActivities = async (guildId: string) => {
    const to = moment().toDate();
    await Promise.all([
        voiceActivityModel.updateMany({ guildId, to: null }, { to }),
        presenceActivityModel.updateMany({ guildId, to: null }, { to }),
    ]);
};

export { checkGuildVoiceEmpty, startVoiceActivity, startPresenceActivity, endPresenceActivity, endVoiceActivity, endGuildActivities };

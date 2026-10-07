import ExtendedClient from "@/client/ExtendedClient";
import { GuildUser } from "@/interfaces/GuildUser";
import { getLastChannelVoiceActivity } from "@/modules/activity";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { Collection, GuildMember, VoiceBasedChannel } from "discord.js";
import { AchievementManager } from "../structures/AchievementManager";
import { CoordinatedAction } from "./coordinatedAction";
import { Host } from "./host";
import { Marathon } from "./marathon";
import { NightOwl } from "./nightOwl";
import { Social } from "./social";
import { Streamer } from "./streamer";
import { Suss } from "./suss";

// These depend on who else is in the channel, so everyone in the affected channels is re-checked
export const checkVoiceChannelMembers = (client: ExtendedClient, member: GuildMember, ...channels: (VoiceBasedChannel | null)[]) => {
    const members = new Collection<string, GuildMember>().set(member.id, member);
    for (const channel of channels)
        channel?.members.forEach(m => members.set(m.id, m));

    members
        .filter(m => !m.user.bot)
        .forEach(m => new AchievementManager({ client, userId: m.id, guildId: m.guild.id })
            .check([new Suss({ member: m }), new Social({ member: m })]));
};

// Takes a GuildUser, so sessions closed without a member at hand (stale sweep, startup validation) count too
export const checkVoiceSessionEnd = (client: ExtendedClient, { userId, guildId }: GuildUser, activity: VoiceActivityDocument | null) => {
    if (!activity?.to)
        return;

    new AchievementManager({ client, userId, guildId })
        .check([new NightOwl({ activity }), new Marathon({ activity })]);
};

// A session starts on join, undeafen or leaving AFK. Host and Coordinated Action used to be checked on join only,
// so a day whose first session started by undeafening had no Host.
export const checkVoiceSessionStart = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel, activity: VoiceActivityDocument) => {
    const lastChannelActivity = await getLastChannelVoiceActivity(member.user.id, channel.id);
    new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
        .check([new CoordinatedAction({ lastChannelActivity, userActivity: activity }), new Host({ activity })]);
};

// Timed achievements used to progress only when the session or stream ended, so they leveled up as the member left
// and the empty-voice sweep deleted the notification seconds later. The experience tick checks open sessions every minute.
// ponytail: a few queries per member in voice per minute, batch the reads if voice ever gets crowded
export const checkVoiceSessionProgress = (client: ExtendedClient, activity: VoiceActivityDocument) => {
    const { userId, guildId } = activity;
    const member = client.guilds.cache.get(guildId)?.members.cache.get(userId);

    new AchievementManager({ client, userId, guildId })
        .check([
            new NightOwl({ activity }),
            new Marathon({ activity }),
            ...(member ? [new Suss({ member })] : []),
            ...(member?.voice.streaming ? [new Streamer({ member, streaming: true })] : []),
        ]);
};

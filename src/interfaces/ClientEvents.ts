import type { BaseAchievement } from "@/modules/achievement/structures/BaseAchievement";
import type { GuildMember, Message, VoiceBasedChannel } from "discord.js";
import type { AchievementType } from "./AchievementType";
import type { ActivityStreak } from "./ActivityStreak";

// Events that discord.js doesn't declare: emitted by discord-logs (src/client/index.ts) and by the bot itself.
// Typed here so handlers and client.emit() calls are checked against each other.
declare module "discord.js" {
    interface ClientEvents {
        // discord-logs
        voiceChannelJoin: [member: GuildMember, channel: VoiceBasedChannel];
        voiceChannelLeave: [member: GuildMember, channel: VoiceBasedChannel];
        voiceChannelSwitch: [member: GuildMember, oldChannel: VoiceBasedChannel, newChannel: VoiceBasedChannel];
        voiceChannelDeaf: [member: GuildMember, deafType: string];
        voiceChannelUndeaf: [member: GuildMember, deafType: string];
        voiceStreamingStart: [member: GuildMember, channel: VoiceBasedChannel];
        voiceStreamingStop: [member: GuildMember, channel: VoiceBasedChannel];
        messagePinned: [message: Message];

        // src/modules/timers.ts
        minute: [];
        quarter: [];
        daily: [];
        weekly: [];
        monthly: [];
        yearly: [];

        // Bot events
        achievementLeveledUp: [achievement: BaseAchievement<AchievementType>, change: number];
        userLeveledUp: [userId: string, guildId: string, oldLevel: number, newLevel: number];
        userReceivedDailyReward: [userId: string, guildId: string, streak: ActivityStreak];
        userSignificantVoiceActivityStreak: [member: GuildMember, streak: ActivityStreak];
        // breakMs is missing for the member's very first voice session
        userBackFromLongVoiceBreak: [member: GuildMember, breakMs?: number];
        guildVoiceEmpty: [guildId: string, channel: VoiceBasedChannel];
    }
}

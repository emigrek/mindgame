import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { GuildMember, Message, VoiceBasedChannel } from "discord.js";

export enum AchievementType {
    UNIQUE_REACTIONS,
    COORDINATED_ACTION,
    SUSS,
    STREAMER,
    GHOST,
    DJ,
    NIGHT_OWL,
    MARATHON,
    SOCIAL,
    HOST,
    COMEBACK
}

export interface AchievementTypePayload {
    [AchievementType.UNIQUE_REACTIONS]: {uniqueReactions: number},
    [AchievementType.COORDINATED_ACTION]: {ms: number, withUserId: string},
    [AchievementType.SUSS]: {from?: Date, aloneMs: number},
    [AchievementType.STREAMER]: {last?: Date, ms: number},
    [AchievementType.GHOST]: undefined,
    [AchievementType.DJ]: {messageCount: number},
    [AchievementType.NIGHT_OWL]: {ms: number},
    [AchievementType.MARATHON]: {topMs: number},
    [AchievementType.SOCIAL]: {userIds: string[]},
    [AchievementType.HOST]: {days: number, lastDay: string},
    [AchievementType.COMEBACK]: {topMs: number}
}

export interface AchievementTypeContext {
    [AchievementType.UNIQUE_REACTIONS]: {message: Message},
    [AchievementType.COORDINATED_ACTION]: {lastChannelActivity?: VoiceActivityDocument, userActivity?: VoiceActivityDocument},
    [AchievementType.SUSS]: {member: GuildMember},
    [AchievementType.STREAMER]: {member: GuildMember, streaming: boolean},
    [AchievementType.GHOST]: {member: GuildMember, channel: VoiceBasedChannel},
    [AchievementType.DJ]: {message: Message},
    [AchievementType.NIGHT_OWL]: {activity: VoiceActivityDocument},
    [AchievementType.MARATHON]: {activity: VoiceActivityDocument},
    [AchievementType.SOCIAL]: {member: GuildMember},
    [AchievementType.HOST]: {activity: VoiceActivityDocument},
    [AchievementType.COMEBACK]: {breakMs: number}
}

export type AchievementUpdatePayload<T extends AchievementType> = Omit<AchievementTypePayload[T], "achievementType">;
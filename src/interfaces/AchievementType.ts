import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { GuildMember, Message, VoiceBasedChannel } from "discord.js";

export enum AchievementType {
    UNIQUE_REACTIONS,
    COORDINATED_ACTION,
    SUSS,
    STREAMER,
    GHOST,
}

export interface AchievementTypePayload {
    [AchievementType.UNIQUE_REACTIONS]: {uniqueReactions: number},
    [AchievementType.COORDINATED_ACTION]: {ms: number, withUserId: string},
    [AchievementType.SUSS]: {from?: Date, aloneMs: number, topAloneMs: number},
    [AchievementType.STREAMER]: {last?: Date, topMs: number, ms: number},
    [AchievementType.GHOST]: undefined,
}

export interface AchievementTypeContext {
    [AchievementType.UNIQUE_REACTIONS]: {message: Message},
    [AchievementType.COORDINATED_ACTION]: {lastChannelActivity?: VoiceActivityDocument, userActivity?: VoiceActivityDocument},
    [AchievementType.SUSS]: {member: GuildMember, channel: VoiceBasedChannel},
    [AchievementType.STREAMER]: {member: GuildMember, channel: VoiceBasedChannel, streaming: boolean},
    [AchievementType.GHOST]: {member: GuildMember, channel: VoiceBasedChannel},
}

export type AchievementUpdatePayload<T extends AchievementType> = Omit<AchievementTypePayload[T], "achievementType">;
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { GuildMember, Message, VoiceBasedChannel } from "discord.js";

export enum AchievementType {
    UNIQUE_REACTIONS,
    COORDINATED_ACTION,
    SUSS,
}

export interface AchievementTypePayload {
    [AchievementType.UNIQUE_REACTIONS]: {uniqueReactions: number},
    [AchievementType.COORDINATED_ACTION]: {ms: number, withUserId: string},
    [AchievementType.SUSS]: {from?: Date, aloneMs: number},
}

export interface AchievementTypeContext {
    [AchievementType.UNIQUE_REACTIONS]: {message: Message},
    [AchievementType.COORDINATED_ACTION]: {first: VoiceActivityDocument, second: VoiceActivityDocument},
    [AchievementType.SUSS]: {member: GuildMember, channel: VoiceBasedChannel},
}

export type AchievementUpdatePayload<T extends AchievementType> = Omit<AchievementTypePayload[T], "achievementType">;
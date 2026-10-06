import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { GuildMember, Message, VoiceBasedChannel } from "discord.js";

// Values are stored in MongoDB and used as translation keys: append only, never reorder or reuse
export enum AchievementType {
    UNIQUE_REACTIONS = 0,
    COORDINATED_ACTION = 1,
    SUSS = 2,
    STREAMER = 3,
    GHOST = 4,
    DJ = 5,
    NIGHT_OWL = 6,
    MARATHON = 7,
    SOCIAL = 8,
    HOST = 9,
    COMEBACK = 10,
    REGULAR = 11
}

export interface AchievementTypePayload {
    [AchievementType.UNIQUE_REACTIONS]: {uniqueReactions: number},
    [AchievementType.COORDINATED_ACTION]: {ms: number, withUserId: string},
    [AchievementType.SUSS]: {from?: Date, activityId?: string, aloneMs: number},
    [AchievementType.STREAMER]: {last?: Date, activityId?: string, ms: number},
    [AchievementType.GHOST]: undefined,
    [AchievementType.DJ]: {messageCount: number},
    [AchievementType.NIGHT_OWL]: {ms: number},
    [AchievementType.MARATHON]: {topMs: number},
    [AchievementType.SOCIAL]: {userIds: string[]},
    [AchievementType.HOST]: {days: number, lastDay: string},
    [AchievementType.COMEBACK]: {topMs: number},
    [AchievementType.REGULAR]: {joinedAt: Date}
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
    [AchievementType.COMEBACK]: {breakMs: number},
    [AchievementType.REGULAR]: {member: GuildMember}
}

export type AchievementUpdatePayload<T extends AchievementType> = Omit<AchievementTypePayload[T], "achievementType">;
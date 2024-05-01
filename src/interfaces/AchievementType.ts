export enum AchievementType {
    UNIQUE_REACTIONS,
    COORDINATED_ACTION,
}

export interface AchievementTypePayload {
    [AchievementType.UNIQUE_REACTIONS]: {uniqueReactions: number},
    [AchievementType.COORDINATED_ACTION]: {ms: number, withUserId: string},
}

export type AchievementUpdatePayload<T extends AchievementType> = Omit<AchievementTypePayload[T], "achievementType">;
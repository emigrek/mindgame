import { AchievementType, AchievementTypePayload } from "./AchievementType";

export interface Achievement<T extends AchievementType = AchievementType> {
    achievementType: T;
    userId: string;
    guildId: string;
    level: number;
    payload?: AchievementTypePayload[T];
}
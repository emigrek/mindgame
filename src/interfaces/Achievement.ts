import { AchievementType, AchievementTypePayload } from "./AchievementType";

export interface Achievement<T extends AchievementType> {
    achievementType: T;
    userId: string;
    guildId: string;
    level: number;
    leveledUpAt: Date;
    payload?: AchievementTypePayload[T];
}
import {achievementModel} from "@/modules/achievement";

export interface Achievement {
    achievementType: AchievementType;
    userId: string;
    guildId: string;
    level: number;
}

export type AchievementParams = Omit<Achievement, "level">;

export enum AchievementType {
    UNIQUE_REACTIONS,
}

export abstract class BaseAchievement implements Achievement {
    achievementType: AchievementType;
    userId: string;
    guildId: string;
    level: number;

    protected constructor({achievementType, userId, guildId}: AchievementParams) {
        this.achievementType = achievementType;
        this.userId = userId;
        this.guildId = guildId;
        this.level = 0;
    }

    abstract check(): Promise<boolean>;

    async get(): Promise<Achievement | null> {
        return achievementModel.findOne({userId: this.userId, guildId: this.guildId, achievementType: this.achievementType});
    }

    async init (): Promise<this> {
        let achievement = await this.get();
        if (!achievement) {
            achievement = await achievementModel.create({userId: this.userId, guildId: this.guildId, achievementType: this.achievementType, level: 0});
        }

        this.level = achievement.level;
        return this;
    }

    async levelUp(): Promise<void> {
        const exists = await this.get();
        if (!exists) {
            await achievementModel.create({userId: this.userId, guildId: this.guildId, achievementType: this.achievementType, level: 1});
            return;
        }

        await achievementModel.updateOne({userId: this.userId, guildId: this.guildId, achievementType: this.achievementType}, {$inc: {level: 1}});
        return;
    }
}

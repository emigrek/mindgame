import ExtendedClient from "@/client/ExtendedClient";
import { config } from '@/config';
import { AchievementType } from "@/interfaces";
import { allAchievements } from "@/modules/achievement";
import { BaseAchievement } from "./BaseAchievement";

interface AchievementManagerProps {
    client: ExtendedClient;
    userId: string;
    guildId: string;
}

class AchievementManager {
    client: ExtendedClient;
    userId: string;
    guildId: string;

    constructor({client, userId, guildId}: AchievementManagerProps) {
        this.client = client;
        this.userId = userId;
        this.guildId = guildId;
    }

    check(achievement: BaseAchievement<AchievementType>): AchievementManager;
    check(achievements: BaseAchievement<AchievementType>[]): AchievementManager;
    check(arg: BaseAchievement<AchievementType> | BaseAchievement<AchievementType>[]): this {
        const { userId, guildId } = this;

        if (!config.achievements.enabled) {
            console.log("Achievments are disabled");
            return this;
        }

        const check = (achievement: BaseAchievement<AchievementType>) => 
            achievement.direct({ userId, guildId })
                .check()
                .then(result => 
                    result && result.leveledUp && this.client.emit("achievementLeveledUp", achievement, result.change)
                );

        if (Array.isArray(arg)) {
            for (const achievement of arg)
                check(achievement)
        } else {
            check(arg);
        }

        return this;
    }

    async getAll(): Promise<BaseAchievement<AchievementType>[]> {
        const { userId, guildId } = this;
        return Promise.all(allAchievements.map(achievement => achievement.direct({ userId, guildId }).get()));
    }
}

export { AchievementManager };


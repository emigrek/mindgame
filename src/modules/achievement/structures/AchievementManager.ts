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

const displayFilter = (display: string[], achievement: BaseAchievement<AchievementType>) => {
    if (display.includes("all")) return true;
    if (display.includes("unlocked") && achievement.level > 0) return true;
    if (display.includes("inprogress") && achievement.level === 0) return true;
    return false;
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

        if (!config.achievements.enabled)
            return this;

        const check = (achievement: BaseAchievement<AchievementType>) => 
            achievement.direct({ userId, guildId })
                .check()
                .then(result => 
                    result && result.leveledUp && this.client.emit("achievementLeveledUp", achievement, result.change)
                )
                .catch(e => console.log("There was an error while checking achievement progress: ", e))

        if (Array.isArray(arg)) {
            for (const achievement of arg)
                check(achievement);
        } else {
            check(arg);
        }

        return this;
    }

    async getAll(display: string[] = ["unlocked"]): Promise<BaseAchievement<AchievementType>[]> {
        const { userId, guildId } = this;
        return Promise.all(allAchievements.map(achievement => achievement.direct({ userId, guildId }).get()))
            .then(achievements => achievements.filter(achievement => displayFilter(display, achievement)));
    }
}

export { AchievementManager };

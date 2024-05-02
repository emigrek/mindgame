import ExtendedClient from "@/client/ExtendedClient";
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

        if (Array.isArray(arg)) {
            for (const achievement of arg)
                achievement.direct({ userId, guildId })
                    .get()
                    .then(() => achievement.check())
                    .then(({leveledUp, change}) => leveledUp && this.client.emit("achievementLeveledUp", achievement, change));
        } else {
            arg.direct({ userId, guildId })
                .get()
                .then(() => arg.check())
                .then(({leveledUp, change}) => leveledUp && this.client.emit("achievementLeveledUp", arg, change));
        }

        return this;
    }

    async getAll(): Promise<BaseAchievement<AchievementType>[]> {
        const { userId, guildId } = this;
        return Promise.all(allAchievements.map(achievement => achievement.direct({ userId, guildId }).get()));
    }
}

export { AchievementManager };


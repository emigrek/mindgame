import ExtendedClient from "@/client/ExtendedClient";
import { AchievementType, BaseAchievement } from "@/interfaces";
import { CoordinatedAction, UniqueReactions } from "./achievements";

interface AchievementManagerProps {
    client: ExtendedClient;
    userId: string;
    guildId: string;
}

class AchievementManager {
    private client: ExtendedClient;
    private readonly achievements: BaseAchievement<AchievementType>[];

    userId: string;
    guildId: string;

    constructor({client, userId, guildId}: AchievementManagerProps) {
        this.client = client;
        this.achievements = [];
        this.userId = userId;
        this.guildId = guildId;
    }

    add(achievement: BaseAchievement<AchievementType>): AchievementManager;
    add(achievements: BaseAchievement<AchievementType>[]): AchievementManager;
    add(arg: BaseAchievement<AchievementType> | BaseAchievement<AchievementType>[]): AchievementManager {
        Array.isArray(arg) ? this.achievements.push(...arg) : this.achievements.push(arg);
        return this;
    }

    async check(): Promise<void> {
        const { userId, guildId } = this;
        for (const achievement of this.achievements)
            await achievement
                .direct({ userId, guildId })
                .get()
                .then(() => achievement.check())
                .then(({leveledUp, change}) => leveledUp && this.client.emit("achievementLeveledUp", achievement, change));
    }

    async get(): Promise<BaseAchievement<AchievementType>[]> {
        const { userId, guildId } = this;
        return Promise.all(
            [
                new CoordinatedAction({}),
                new UniqueReactions({}),
            ]
                .map(achievement => achievement.direct({ userId, guildId }).get())
        );
    }
}

export { AchievementManager };


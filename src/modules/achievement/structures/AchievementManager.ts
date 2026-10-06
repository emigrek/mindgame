import ExtendedClient from "@/client/ExtendedClient";
import { config } from '@/config';
import { AchievementType } from "@/interfaces";
// getAllAchievements is only called inside methods: ../index imports this file through ./structures
import { getAllAchievements } from "@/modules/achievement";
import { achievementModel } from "../model";
import { serialized } from "@/utils/serialized";
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

        // Music bots sit in voice too, they must not collect achievements or trigger announcements
        if (this.client.users.cache.get(userId)?.bot)
            return this;

        // One achievement of one member is checked at a time. discord-logs fires several events per voiceStateUpdate
        // and each re-checks the whole channel, so parallel read-modify-write of the payload lost updates and announced twice.
        const check = (achievement: BaseAchievement<AchievementType>) =>
            serialized(`${userId}:${guildId}:${achievement.achievementType}`, () => achievement.direct({ userId, guildId }).check())
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
        // One query for the member's achievements instead of one per achievement on every page click
        const stored = await achievementModel.find({ userId, guildId });
        const byType = new Map(stored.map(achievement => [achievement.achievementType, achievement]));
        return getAllAchievements()
            .map(achievement => achievement.direct({ userId, guildId }).hydrate(byType.get(achievement.achievementType) ?? null))
            .filter(achievement => displayFilter(display, achievement));
    }
}

export { AchievementManager };

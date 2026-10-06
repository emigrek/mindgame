import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const day = 1000 * 60 * 60 * 24;

export class Comeback extends GradualAchievement<AchievementType.COMEBACK> {
    emoji = "🪃";
    levels = [3, 7, 14, 30, 90, 180, 365]
        .map((days, index) => ({ value: days * day, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.COMEBACK>) {
        super({ context, achievementType: AchievementType.COMEBACK });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.COMEBACK]) {
        return { topMs: formatDuration(payload.topMs || 0) };
    }

    // Longest break from voice channels before coming back
    async progress(context: AchievementTypeContext[AchievementType.COMEBACK]) {
        const { breakMs } = context;
        const topMs = this.payload?.topMs || 0;
        if (breakMs > topMs)
            await this.updatePayload({ topMs: breakMs });

        // Also without a new record: reach() is a no-op at the current level and catches up after changed thresholds
        return this.reach(Math.max(breakMs, topMs));
    }
}

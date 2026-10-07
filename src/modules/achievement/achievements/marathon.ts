import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class Marathon extends GradualAchievement<AchievementType.MARATHON> {
    emoji = "🏃";
    levels = [2, 4, 6, 8, 12, 16, 24]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.MARATHON>) {
        super({ context, achievementType: AchievementType.MARATHON });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.MARATHON]) {
        return { topMs: formatDuration(payload.topMs || 0) };
    }

    // Longest single voice session, an open one counted up to now by the minute tick
    async progress(context: AchievementTypeContext[AchievementType.MARATHON]) {
        const { from, to } = context.activity;
        const sessionMs = (to ?? new Date()).getTime() - from.getTime();
        const topMs = this.payload?.topMs || 0;
        if (sessionMs > topMs)
            await this.updatePayload({ topMs: sessionMs });

        // Also without a new record: reach() is a no-op at the current level and catches up after changed thresholds
        return this.reach(Math.max(sessionMs, topMs));
    }
}

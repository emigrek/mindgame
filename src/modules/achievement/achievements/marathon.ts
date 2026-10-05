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

    // Longest single voice session, counted when it ends
    async progress(context: AchievementTypeContext[AchievementType.MARATHON]) {
        const { from, to } = context.activity;
        const sessionMs = to ? to.getTime() - from.getTime() : 0;
        if (sessionMs <= (this.payload?.topMs || 0))
            return;

        await this.updatePayload({ topMs: sessionMs });
        return this.reach(sessionMs);
    }
}

import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { formatDuration, getNightMs } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class NightOwl extends GradualAchievement<AchievementType.NIGHT_OWL> {
    emoji = "🦉";
    levels = [1, 5, 10, 25, 50, 100, 250]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.NIGHT_OWL>) {
        super({ context, achievementType: AchievementType.NIGHT_OWL });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.NIGHT_OWL]) {
        return { ms: formatDuration(payload.ms || 0) };
    }

    // Total voice time at night, counted when a voice session ends
    async progress(context: AchievementTypeContext[AchievementType.NIGHT_OWL]) {
        const { from, to } = context.activity;
        const nightMs = to ? getNightMs(from, to) : 0;
        if (!nightMs)
            return;

        await this.updatePayload({ ms: (this.payload?.ms || 0) + nightMs });
        return this.reach(this.payload?.ms || 0);
    }
}

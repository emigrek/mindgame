import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { formatDuration, getWarsawHour } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

// Part of [from, to) between 0:00 and 5:00 Europe/Warsaw. Its offsets are whole hours, so stepping by UTC hours is exact.
export const getNightMs = (from: Date, to: Date) => {
    let ms = 0;
    for (let t = from.getTime(); t < to.getTime();) {
        const next = Math.min((Math.floor(t / hour) + 1) * hour, to.getTime());
        if (getWarsawHour(t) < 5)
            ms += next - t;
        t = next;
    }
    return ms;
};

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

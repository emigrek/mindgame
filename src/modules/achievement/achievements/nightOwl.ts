import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { formatDuration, getNightMs } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class NightOwl extends GradualAchievement<AchievementType.NIGHT_OWL> {
    emoji = "🦉";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/owl_1f989.png";
    levels = [5, 10, 25, 50, 100, 250]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.NIGHT_OWL>) {
        super({ context, achievementType: AchievementType.NIGHT_OWL });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.NIGHT_OWL]) {
        return { ms: formatDuration(payload.ms || 0) };
    }

    // Total voice time at night. Checked by the minute tick while the session is open and once more when it ends;
    // `until` marks how far the session is counted, so no part of it is counted twice.
    async progress(context: AchievementTypeContext[AchievementType.NIGHT_OWL]) {
        const { _id, from, to } = context.activity;
        const activityId = String(_id);
        const { ms = 0, until } = this.payload ?? {};

        const start = this.payload?.activityId === activityId && until ? until : from;
        const end = to ?? new Date();
        const nightMs = getNightMs(start, end);
        if (!nightMs)
            return;

        await this.updatePayload({ ms: ms + nightMs, activityId, until: end });
        return this.reach(ms + nightMs);
    }
}

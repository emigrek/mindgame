import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const minute = 1000 * 60;
const hour = minute * 60;

export class Inseparable extends GradualAchievement<AchievementType.INSEPARABLE> {
    emoji = "🧑‍🤝‍🧑";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/people-holding-hands_1f9d1-200d-1f91d-200d-1f9d1.png";
    levels = [10, 25, 50, 100, 250, 500, 1000]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.INSEPARABLE>) {
        super({ context, achievementType: AchievementType.INSEPARABLE });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.INSEPARABLE]) {
        const [withUserId, ms] = topPartner(payload.ms);
        return { withUserId, ms: formatDuration(ms) };
    }

    // Time spent in the same voice channel with one person, the one with the most time counts.
    // ponytail: credited a minute per experience tick, like voice EXP, so a skipped tick is a lost minute
    async progress(context: AchievementTypeContext[AchievementType.INSEPARABLE]) {
        const { userIds } = context;
        if (!userIds.length)
            return;

        // ponytail: one entry per partner in the payload, fine for guild-sized sets
        const ms = { ...this.payload?.ms };
        for (const userId of userIds)
            ms[userId] = (ms[userId] || 0) + minute;

        await this.updatePayload({ ms });
        return this.reach(topPartner(ms)[1]);
    }
}

const topPartner = (ms: Record<string, number> = {}) =>
    Object.entries(ms).reduce<[string, number]>((top, entry) => entry[1] > top[1] ? entry : top, ["", 0]);

import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { getWarsawDay } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class Host extends GradualAchievement<AchievementType.HOST> {
    emoji = "🏠";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/house-building_1f3e0.png";
    // Joining an empty server first once is luck, the first level takes a week of it
    levels = [7, 14, 30, 60, 100, 200, 365]
        .map((days, index) => ({ value: days, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.HOST>) {
        super({ context, achievementType: AchievementType.HOST });
    }

    // Days on which the user was the first to join voice in the guild (Europe/Warsaw days)
    async progress(context: AchievementTypeContext[AchievementType.HOST]) {
        const { guildId, from } = context.activity;
        const day = getWarsawDay(from);
        if (this.payload?.lastDay === day)
            return;

        const previous = await voiceActivityModel.findOne({ guildId, from: { $lt: from } }).sort({ from: -1 });
        if (previous && getWarsawDay(previous.from) === day)
            return;

        await this.updatePayload({ days: (this.payload?.days || 0) + 1, lastDay: day });
        return this.reach(this.payload?.days || 0);
    }
}

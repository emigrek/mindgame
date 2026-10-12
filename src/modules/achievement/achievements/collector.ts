import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { achievementModel } from "../model";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class Collector extends GradualAchievement<AchievementType.COLLECTOR> {
    emoji = "🏅";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/sports-medal_1f3c5.png";
    // Members with a history jump several levels on their first check
    announceLevelJumps = false;
    levels = [10, 20, 35, 50, 75, 100]
        .map((levels, index) => ({ value: levels, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.COLLECTOR>) {
        super({ context, achievementType: AchievementType.COLLECTOR });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.COLLECTOR]) {
        return { levels: payload.levels || 0 };
    }

    // Sum of the levels of every other achievement, checked whenever one of them levels up
    async progress(context: AchievementTypeContext[AchievementType.COLLECTOR]) {
        if (context.leveledUpType === AchievementType.COLLECTOR)
            return;

        const others = await achievementModel.find({
            userId: this.userId,
            guildId: this.guildId,
            achievementType: { $ne: AchievementType.COLLECTOR },
        });
        const levels = others.reduce((sum, achievement) => sum + (achievement.level || 0), 0);
        if (levels !== this.payload?.levels)
            await this.updatePayload({ levels });

        return this.reach(levels);
    }
}

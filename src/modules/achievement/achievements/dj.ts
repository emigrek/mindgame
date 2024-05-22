import { config } from "@/config";
import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { BaseAchievementContext, LinearAchievement } from "@/modules/achievement/structures";

export class DJ extends LinearAchievement<AchievementType.DJ> {
    achievementType = AchievementType.DJ;
    emoji = "💽"
    formula = () => {
        const { messageCount } = this.payload || {};
        const leveledUp = (messageCount || 0) >= this.level * 5;
        return {
            leveledUp,
            change: leveledUp ? 1 : 0
        };
    }

    constructor(context?: BaseAchievementContext<AchievementType.DJ>) {
        super({ 
            context,
            achievementType: AchievementType.DJ
        });
    }

    async progress(context: AchievementTypeContext[AchievementType.DJ]) {
        const { message } = context;
        const { messageCount } = this.payload || {};

        const content = message.content.trim();
        const playRegExp = new RegExp(`.*[${config.emptyGuildSweepBotPrefixesList.map(prefix => prefix)}]play\\s`);

        if (!playRegExp.test(content))
            return;

        await this.updatePayload({ messageCount: (messageCount || 0) + 1 });

        const result = this.formula();
        if (!result.leveledUp)
            return;

        return this.levelUp()
            .then(() => result);
    }
}
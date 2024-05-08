import { AchievementType } from "@/interfaces";
import { BaseAchievementContext, LinearAchievement } from "@/modules/achievement/structures";
import { getMessageReactionsUniqueUsers } from "@/modules/ephemeral-channel";

export class UniqueReactions extends LinearAchievement<AchievementType.UNIQUE_REACTIONS> {
    achievementType = AchievementType.UNIQUE_REACTIONS;
    emoji = "⭐";
    formula = () => {
        const { uniqueReactions } = this.payload || {};
        const leveledUp = (uniqueReactions || 0) > 2 && (uniqueReactions || 0) >= this.level * 3;
        return {
            leveledUp,
            change: leveledUp ? 1 : 0
        };
    }

    constructor(context?: BaseAchievementContext<AchievementType.UNIQUE_REACTIONS>) {
        super({ context, achievementType: AchievementType.UNIQUE_REACTIONS });
    }

    async progress() {
        if (!this.context)
            throw new Error("The achievement's context must be provided to progress.");

        const { message } = this.context;

        const uniqueReactions = await getMessageReactionsUniqueUsers(message)
            .then((reactions) => reactions.length);
        
        const result = this.formula();
        if (!result.leveledUp) return;

        return this.updatePayload({ uniqueReactions })
            .then(() => this.levelUp())
            .then(() => result);
    }
}
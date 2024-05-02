import { AchievementType, AchievementTypePayload } from "@/interfaces";
import { LinearAchievement } from "@/modules/achievement/structures";
import { getMessageReactionsUniqueUsers } from "@/modules/ephemeral-channel";

export class UniqueReactions extends LinearAchievement<AchievementType.UNIQUE_REACTIONS> {
    achievementType = AchievementType.UNIQUE_REACTIONS;
    emoji = "⭐";

    async progress() {
        if (!this.context)
            throw new Error("The achievement's context must be provided to progress.");

        const { message } = this.context;
        const uniqueReactions = await getMessageReactionsUniqueUsers(message)
            .then((reactions) => reactions.length)
        
        const result = this.formula({ uniqueReactions });
        return result.leveledUp ? this.updatePayload({ uniqueReactions })
            .then(() => this.levelUp())
            .then(() => result) : result;
    }

    formula = (payload: AchievementTypePayload[AchievementType.UNIQUE_REACTIONS]) => {
        const { uniqueReactions } = payload;
        const leveledUp = uniqueReactions > 2 && uniqueReactions >= this.level * 3;
        return {
            leveledUp,
            change: leveledUp ? 1 : 0
        };
    }
}
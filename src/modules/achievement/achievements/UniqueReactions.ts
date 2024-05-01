import { AchievementType, AchievementTypePayload } from "@/interfaces";
import { LinearAchievement } from "@/modules/achievement/structures";
import { getMessageReactionsUniqueUsers } from "@/modules/ephemeral-channel";
import { Message } from "discord.js";

interface UniqueReactionsPayload {
    message?: Message;
}

export class UniqueReactions extends LinearAchievement<AchievementType.UNIQUE_REACTIONS> {
    achievementType = AchievementType.UNIQUE_REACTIONS;
    message?: Message;
    emoji = "⭐";

    constructor({message}: UniqueReactionsPayload = {}) {
        super();
        this.message = message;
    }

    async progress() {
        if (!this.message) 
            throw new Error("The achievement must have a message to progress.");

        const uniqueReactions = await getMessageReactionsUniqueUsers(this.message)
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
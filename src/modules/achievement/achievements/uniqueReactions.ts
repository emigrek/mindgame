import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { getMessageReactionsUniqueUsers } from "@/modules/ephemeral-channel";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class UniqueReactions extends GradualAchievement<AchievementType.UNIQUE_REACTIONS> {
    emoji = "⭐";
    levels = [
        {
            value: 3,
            level: 1
        },
        {
            value: 5,
            level: 2
        },
        {
            value: 10,
            level: 3
        },
        {
            value: 15,
            level: 4
        },
        {
            value: 25,
            level: 5
        },
        {
            value: 35,
            level: 6
        },
        {
            value: 50,
            level: 7
        }
    ];

    constructor(context?: BaseAchievementContext<AchievementType.UNIQUE_REACTIONS>) {
        super({ context, achievementType: AchievementType.UNIQUE_REACTIONS });
    }

    // Record of unique users (excluding author and bots) reacting to a single message
    async progress(context: AchievementTypeContext[AchievementType.UNIQUE_REACTIONS]) {
        const uniqueReactions = await getMessageReactionsUniqueUsers(context.message)
            .then((users) => users.length);

        if (uniqueReactions <= (this.payload?.uniqueReactions || 0))
            return;

        await this.updatePayload({ uniqueReactions });
        return this.reach(uniqueReactions);
    }
}

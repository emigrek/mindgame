import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { getMessageReactionsUniqueUsers } from "@/modules/ephemeral-channel";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class UniqueReactions extends GradualAchievement<AchievementType.UNIQUE_REACTIONS> {
    emoji = "⭐";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/white-medium-star_2b50.png";
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
        const record = this.payload?.uniqueReactions || 0;

        // Reaction counts include the author and bots, so they cap the unique users: no new record is possible
        // without fetching who reacted (one API call per emoji)
        const reactionCount = context.message.reactions.cache.reduce((sum, reaction) => sum + reaction.count, 0);
        const uniqueReactions = reactionCount > record
            ? await getMessageReactionsUniqueUsers(context.message).then((users) => users.length)
            : 0;

        if (uniqueReactions > record)
            await this.updatePayload({ uniqueReactions });

        // Also without a new record: reach() is a no-op at the current level and catches up after changed thresholds
        return this.reach(Math.max(uniqueReactions, record));
    }
}

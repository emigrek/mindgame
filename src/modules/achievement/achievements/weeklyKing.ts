import ExtendedClient from "@/client/ExtendedClient";
import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { UserGuildStatisticsModel } from "@/modules/user-guild-statistics";
import { formatDuration } from "@/utils/date";
import { AchievementManager } from "../structures/AchievementManager";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class WeeklyKing extends GradualAchievement<AchievementType.WEEKLY_KING> {
    emoji = "👑";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/crown_1f451.png";
    levels = [1, 3, 5, 10, 25, 52]
        .map((weeks, index) => ({ value: weeks, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.WEEKLY_KING>) {
        super({ context, achievementType: AchievementType.WEEKLY_KING });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.WEEKLY_KING]) {
        return { weeks: payload.weeks || 0, topMs: formatDuration(payload.topMs || 0) };
    }

    // Weeks won with the most voice time in the guild
    async progress(context: AchievementTypeContext[AchievementType.WEEKLY_KING]) {
        const weeks = (this.payload?.weeks || 0) + 1;
        await this.updatePayload({ weeks, topMs: Math.max(context.voiceMs, this.payload?.topMs || 0) });
        return this.reach(weeks);
    }
}

// Run by the weekly timer before the week statistics are cleared
export const checkWeeklyKings = async (client: ExtendedClient) => {
    for (const guildId of client.guilds.cache.keys()) {
        // ponytail: unindexed sort once a week per guild, add {guildId, "week.time.voice"} if the collection grows
        const top = await UserGuildStatisticsModel.findOne({ guildId, "week.time.voice": { $gt: 0 } }).sort({ "week.time.voice": -1 });
        if (top)
            new AchievementManager({ client, userId: top.userId, guildId })
                .check(new WeeklyKing({ voiceMs: top.week.time.voice * 1000 }));
    }
};

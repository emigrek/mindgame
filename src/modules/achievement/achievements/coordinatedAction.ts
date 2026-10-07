import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class CoordinatedAction extends GradualAchievement<AchievementType.COORDINATED_ACTION> {
    emoji = "🤝";
    lowerIsBetter = true;
    // Minutes apart is just joining a friend, the first level takes an agreed moment
    levels = [30, 15, 5, 2, 1, 0.5, 0.25]
        .map((seconds, index) => ({ value: seconds * 1000, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.COORDINATED_ACTION>) {
        super({
            context,
            achievementType: AchievementType.COORDINATED_ACTION
        });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.COORDINATED_ACTION]) {
        return { ...payload, ms: formatDuration(payload.ms) };
    }

    async progress(context: AchievementTypeContext[AchievementType.COORDINATED_ACTION]) {
        const { lastChannelActivity, userActivity } = context;

        if (!lastChannelActivity || !userActivity)
            return;

        const { guildId, channelId } = userActivity;
        const channelActivities = await voiceActivityModel.find({ guildId, channelId, to: null });

        if (channelActivities.length > 2)
            return;

        const diff = Math.abs(userActivity.from.getTime() - lastChannelActivity.from.getTime());
        if (!this.payload || diff < this.payload.ms)
            await this.updatePayload({ ms: diff, withUserId: lastChannelActivity.userId });

        return this.reach(diff);
    }
}

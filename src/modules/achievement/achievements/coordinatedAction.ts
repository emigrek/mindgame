import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class CoordinatedAction extends GradualAchievement<AchievementType.COORDINATED_ACTION> {
    emoji = "🤝";
    lowerIsBetter = true;
    levels = [
        {
            value: 1000 * 60 * 10,
            level: 1
        },
        {
            value: 1000 * 60 * 5,
            level: 2
        },
        {
            value: 1000 * 60 * 2,
            level: 3
        },
        {
            value: 1000 * 60,
            level: 4
        },
        {
            value: 1000 * 15,
            level: 5
        },
        {
            value: 1000 * 5,
            level: 6
        },
        {
            value: 1000 * 1,
            level: 7
        },
        {
            value: 1000 * 0.5,
            level: 8
        },
        {
            value: 1000 * 0.25,
            level: 9
        }
    ];

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

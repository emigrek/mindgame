import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class Suss extends GradualAchievement<AchievementType.SUSS> {
    emoji = "🤫";
    levels = [1, 5, 10, 25, 50, 100, 250, 500]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.SUSS>) {
        super({ context, achievementType: AchievementType.SUSS });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.SUSS]) {
        return { ...payload, aloneMs: formatDuration(payload.aloneMs || 0) };
    }

    // Total time spent alone (no other active voice activity in the channel)
    async progress(context: AchievementTypeContext[AchievementType.SUSS]) {
        const { member } = context;
        const guildId = member.guild.id;

        const activity = await voiceActivityModel.findOne({ userId: member.id, guildId, to: null });
        const alone = !!activity && await voiceActivityModel.countDocuments({ guildId, channelId: activity.channelId, to: null }) === 1;
        const from = this.payload?.from;

        if (alone && !from) {
            await this.updatePayload({ from: new Date() });
        } else if (!alone && from) {
            await this.updatePayload({
                from: undefined,
                aloneMs: (this.payload?.aloneMs || 0) + Date.now() - from.getTime()
            });
        }

        return this.reach(this.payload?.aloneMs || 0);
    }
}


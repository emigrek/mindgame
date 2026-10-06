import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class Streamer extends GradualAchievement<AchievementType.STREAMER> {
    emoji = "🖥️";
    levels = [1, 5, 10, 25, 50, 100, 250, 500]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.STREAMER>) {
        super({ context, achievementType: AchievementType.STREAMER });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.STREAMER]) {
        return { ...payload, ms: formatDuration(payload.ms || 0) };
    }

    // Total time streaming with an audience (someone else active in the channel at stream start)
    async progress(context: AchievementTypeContext[AchievementType.STREAMER]) {
        const { member, streaming } = context;
        const { channelId, guild } = member.voice;

        const activity = await voiceActivityModel.findOne({ userId: member.id, guildId: guild.id, to: null });
        let { last, activityId, ms = 0 } = this.payload ?? {};

        // A stream left open by a session that ended unseen counts only until that session ended
        if (last && String(activity?._id) !== activityId) {
            const ended = activityId ? await voiceActivityModel.findById(activityId) : null;
            ms += ended?.to ? Math.max(0, ended.to.getTime() - last.getTime()) : 0;
            last = undefined;
        }

        if (streaming) {
            const audience = activity && channelId && channelId !== guild.afkChannelId
                ? await voiceActivityModel.countDocuments({ guildId: guild.id, channelId, to: null, userId: { $ne: member.id } })
                : 0;
            // Always overwrite, so a stop missed earlier doesn't count the gap
            last = audience ? new Date() : undefined;
            activityId = activity ? String(activity._id) : undefined;
        } else if (last) {
            ms += Date.now() - last.getTime();
            last = undefined;
        }

        await this.updatePayload({ last, activityId: last ? activityId : undefined, ms });
        return this.reach(ms);
    }
}

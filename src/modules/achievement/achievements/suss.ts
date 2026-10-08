import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class Suss extends GradualAchievement<AchievementType.SUSS> {
    emoji = "🤫";
    emojiImage = "https://em-content.zobj.net/source/microsoft/106/face-with-finger-covering-closed-lips_1f92b.png";
    levels = [5, 10, 25, 50, 100, 250, 500]
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
        let { from, activityId, aloneMs = 0 } = this.payload ?? {};

        // An interval left open by a session that ended unseen (restart, missed leave, stale sweep)
        // counts only until that session ended, not until now
        if (from && String(activity?._id) !== activityId) {
            const ended = activityId ? await voiceActivityModel.findById(activityId) : null;
            aloneMs += ended?.to ? Math.max(0, ended.to.getTime() - from.getTime()) : 0;
            from = undefined;
        }

        // The open interval is banked on every check, also by the minute tick, so time alone counts while still in the channel
        const now = new Date();
        if (from) {
            aloneMs += now.getTime() - from.getTime();
            from = undefined;
        }

        const alone = !!activity && await voiceActivityModel.countDocuments({ guildId, channelId: activity.channelId, to: null }) === 1;
        if (alone) {
            from = now;
            activityId = String(activity._id);
        }

        if (from !== this.payload?.from || aloneMs !== (this.payload?.aloneMs || 0))
            await this.updatePayload({ from, activityId: from ? activityId : undefined, aloneMs });

        return this.reach(aloneMs);
    }
}


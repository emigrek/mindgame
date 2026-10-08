import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { formatDuration } from "@/utils/date";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class Streamer extends GradualAchievement<AchievementType.STREAMER> {
    emoji = "🖥️";
    emojiImage = "https://em-content.zobj.net/source/microsoft/74/desktop-computer_1f5a5.png";
    levels = [5, 10, 25, 50, 100, 250, 500]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.STREAMER>) {
        super({ context, achievementType: AchievementType.STREAMER });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.STREAMER]) {
        return { ...payload, ms: formatDuration(payload.ms || 0) };
    }

    // Total time streaming with an audience (someone else active in the channel)
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

        // The open interval is banked on every check, also by the minute tick, so stream time counts while still streaming
        const now = new Date();
        if (last) {
            ms += now.getTime() - last.getTime();
            last = undefined;
        }

        if (streaming) {
            // Re-checked every tick: the stream counts only while someone else is in the channel
            const audience = activity && channelId && channelId !== guild.afkChannelId
                ? await voiceActivityModel.countDocuments({ guildId: guild.id, channelId, to: null, userId: { $ne: member.id } })
                : 0;
            last = audience ? now : undefined;
            activityId = activity ? String(activity._id) : undefined;
        }

        if (last !== this.payload?.last || ms !== (this.payload?.ms || 0))
            await this.updatePayload({ last, activityId: last ? activityId : undefined, ms });
        return this.reach(ms);
    }
}

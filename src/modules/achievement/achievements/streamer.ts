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
        const last = this.payload?.last;

        if (streaming) {
            const audience = channelId && channelId !== guild.afkChannelId
                ? await voiceActivityModel.countDocuments({ guildId: guild.id, channelId, to: null, userId: { $ne: member.id } })
                : 0;
            // Always overwrite, so a stop missed earlier doesn't count the gap
            await this.updatePayload({ last: audience ? new Date() : undefined });
        } else if (last) {
            await this.updatePayload({
                last: undefined,
                ms: (this.payload?.ms || 0) + Date.now() - last.getTime()
            });
        }

        return this.reach(this.payload?.ms || 0);
    }
}

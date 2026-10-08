import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class Social extends GradualAchievement<AchievementType.SOCIAL> {
    emoji = "🦋";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/butterfly_1f98b.png";
    levels = [5, 10, 25, 50, 100, 200]
        .map((users, index) => ({ value: users, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.SOCIAL>) {
        super({ context, achievementType: AchievementType.SOCIAL });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.SOCIAL]) {
        return { count: payload.userIds?.length || 0 };
    }

    // Distinct users met in a voice channel (both with an active voice activity)
    async progress(context: AchievementTypeContext[AchievementType.SOCIAL]) {
        const { member } = context;
        const guildId = member.guild.id;

        const activity = await voiceActivityModel.findOne({ userId: member.id, guildId, to: null });
        if (!activity)
            return;

        const others = await voiceActivityModel.find({ guildId, channelId: activity.channelId, to: null, userId: { $ne: member.id } });
        const known = new Set(this.payload?.userIds || []);
        const met = others.map(other => other.userId).filter(userId => !known.has(userId));
        if (!met.length)
            return;

        // ponytail: ids kept in the payload, fine for guild-sized sets
        await this.updatePayload({ userIds: [...known, ...met] });
        return this.reach(known.size + met.length);
    }
}

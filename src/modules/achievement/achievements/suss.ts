import { AchievementType } from "@/interfaces";
import { BaseAchievementContext, GradualAchievement } from "@/modules/achievement/structures";
import { voiceActivityModel } from "@/modules/activity";

export class Suss extends GradualAchievement<AchievementType.SUSS> {
    achievementType = AchievementType.SUSS;
    emoji = "🤫";
    levels = [
        {
            value: 1000 * 60 * 5,
            level: 1
        },
        {
            value: 1000 * 60 * 10,
            level: 2
        },
        {
            value: 1000 * 60 * 30,
            level: 3
        },
        {
            value: 1000 * 60 * 60,
            level: 4
        },
        {
            value: 1000 * 60 * 60 * 2,
            level: 5
        },
    ];

    constructor(context?: BaseAchievementContext<AchievementType.SUSS>) {
        super({ context, achievementType: AchievementType.SUSS });
    }

    async progress() {
        if (!this.context)
            throw new Error("The achievement's context and payload must be provided to progress.");

        const { member, channel } = this.context;
        const { from, aloneMs, topAloneMs } = this.payload || {};

        if (channel.id === member.guild.afkChannelId) 
            return;

        const channelVoiceActivities = await voiceActivityModel.find({ guildId: member.guild.id, channelId: channel.id, to: null });
        const userVoiceActivity = channelVoiceActivities.find(activity => activity.userId === this.userId);
        const noUserActivity = userVoiceActivity === undefined;
        const usersJoined = userVoiceActivity && channelVoiceActivities.length > 1

        if (noUserActivity || usersJoined) {
            if (!from)
                return;

            const diff = new Date().getTime() - from.getTime();
            await this.updatePayload({
                from: undefined,
                aloneMs: aloneMs || 0 + diff,
                topAloneMs: Math.max(aloneMs || 0 + diff, topAloneMs || 0)
            });
        } else if (channelVoiceActivities.length === 1 && userVoiceActivity) {
            await this.updatePayload({
                from: new Date(),
                aloneMs: 0,
                topAloneMs: Math.max(aloneMs || 0, topAloneMs || 0)
            });
        }

        const result = this.findClosestLevelThreshold(aloneMs || 0);
        if (!result || result.level <= this.level) 
            return;

        return this.setLevel(result.level)
            .then(() => ({ leveledUp: true, change: result.level - this.level }));
    }
}


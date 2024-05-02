import { AchievementType } from "@/interfaces";
import { GradualAchievement } from "@/modules/achievement/structures";
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

    async progress() {
        if (!this.context)
            throw new Error("The achievement's context must be provided to progress.");

        const { member, channel } = this.context;
        const channelVoiceActivities = await voiceActivityModel.find({ guildId: member.guild.id, channelId: channel.id, to: null });
        const userVoiceActivity = channelVoiceActivities.find(activity => activity.userId === this.userId);

        if (!userVoiceActivity || channelVoiceActivities.length > 1 && userVoiceActivity) {
            await this.updateAloneTime();
        } else if (channelVoiceActivities.length === 1 && userVoiceActivity) {
            await this.updatePayload({
                from: new Date(),
                aloneMs: 0,
            });
        }

        const threshold = this.findClosestLevelThreshold(this.payload?.aloneMs || 0);

        if (!threshold || threshold.level <= this.level) 
            return { leveledUp: false, change: 0 };

        return this.setLevel(threshold.level)
            .then(() => ({ leveledUp: true, change: threshold.level - this.level }));
    }

    async updateAloneTime() {
        if (!this.payload?.from || !this.payload?.aloneMs) return;

        const { from, aloneMs } = this.payload;
        const diff = new Date().getTime() - from.getTime();

        return this.updatePayload({
            from: undefined,
            aloneMs: aloneMs + diff,
        });
    }
}


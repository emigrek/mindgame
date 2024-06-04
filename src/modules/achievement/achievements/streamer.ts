import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { BaseAchievementContext, LinearAchievement } from "@/modules/achievement/structures";
import { voiceActivityModel } from "@/modules/activity";

export class Streamer extends LinearAchievement<AchievementType.STREAMER> {
    achievementType = AchievementType.STREAMER;
    emoji = "🖥️";
    formula = () => {
        const { ms } = this.payload || {};
        const leveledUp = (ms || 0)  >= this.level * 5 * 60 * 1000;
        return {
            leveledUp,
            change: leveledUp ? 1 : 0
        };
    }

    constructor(context?: BaseAchievementContext<AchievementType.STREAMER>) {
        super({ context, achievementType: AchievementType.STREAMER });
    }

    async progress(context: AchievementTypeContext[AchievementType.STREAMER]) {
        const { member, channel, streaming } = context;
        if (channel.id === member.guild.afkChannelId) 
            return;

        const channelActivities = await voiceActivityModel.find({ guildId: member.guild.id, channelId: channel.id, to: null });
        if (channelActivities.length < 2)
            return;

        if (streaming) {
            await this.updatePayload({
                last: new Date(),
                ms: 0,
            });
        } else if (this.payload?.last) {
            const diff = new Date().getTime() - this.payload?.last.getTime();
            await this.updatePayload({ 
                last: undefined,
                ms: this.payload?.ms || 0 + diff,
                topMs: Math.max(this.payload?.ms || 0 + diff, this.payload?.topMs || 0)
            });
        }

        const result = this.formula();
        if (result.leveledUp) {
            await this.levelUp();
            return result;
        }
    }
}
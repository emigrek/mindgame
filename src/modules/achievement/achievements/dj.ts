import { config } from "@/config";
import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { BaseAchievementContext, GradualAchievement } from "@/modules/achievement/structures";
import { voiceActivityModel } from "@/modules/activity";

export class DJ extends GradualAchievement<AchievementType.DJ> {
    achievementType = AchievementType.DJ;
    emoji = "💽"
    levels = [
        {
            value: 5,
            level: 1
        },
        {
            value: 10,
            level: 2
        },
        {
            value: 30,
            level: 3
        },
        {
            value: 60,
            level: 4
        },
        {
            value: 100,
            level: 5
        },
        {
            value: 200,
            level: 6
        },
        {
            value: 300,
            level: 7
        },
        {
            value: 500,
            level: 8
        },
        {
            value: 1000,
            level: 9
        }
    ];

    constructor(context?: BaseAchievementContext<AchievementType.DJ>) {
        super({ 
            context,
            achievementType: AchievementType.DJ
        });
    }

    async progress(context: AchievementTypeContext[AchievementType.DJ]) {
        const { message } = context;

        const content = message.content.trim();
        const prefixes = config.emptyGuildSweepBotPrefixesList.map(prefix => prefix);
        const playRegExp = new RegExp(`.*[${prefixes}]play\\s`);
        
        if (!playRegExp.test(content) || !message.guild)
            return;
        
        const voiceActive = await voiceActivityModel.findOne({ userId: message.author.id, guildId: message.guild.id, to: null });
        if (!voiceActive)
            return;

        await this.updatePayload({ messageCount: (this.payload?.messageCount || 0) + 1 });

        const result = this.findClosestLevelThreshold(this.payload?.messageCount || 0);
        if (!result || result.level <= this.level) 
            return;
        
        return this.setLevel(result.level)
            .then(() => ({ leveledUp: true, change: result.level - this.level }));
    }
}
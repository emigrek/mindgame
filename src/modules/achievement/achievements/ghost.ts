import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { BaseAchievement, BaseAchievementContext } from "@/modules/achievement/structures";

export class Ghost extends BaseAchievement<AchievementType.GHOST> {
    achievementType = AchievementType.GHOST;
    emoji = "👻";

    constructor(context?: BaseAchievementContext<AchievementType.GHOST>) {
        super({ 
            context,
            achievementType: AchievementType.GHOST
        });
    }

    async progress(context: AchievementTypeContext[AchievementType.GHOST]) {
        const { member, channel } = context;

        if (channel.id === member.guild.afkChannelId || !member.presence || !member.voice.channel) 
            return;

        if (!["invisible", "offline"].includes(member.presence.status)) 
            return;

        if (this.level !== 0) 
            return;

        return this.setLevel(1)
            .then(() => ({
                leveledUp: true,
                change: 1
            }));
    }
}
import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { BaseAchievement, BaseAchievementContext } from "../structures/BaseAchievement";

export class Ghost extends BaseAchievement<AchievementType.GHOST> {
    emoji = "👻";

    constructor(context?: BaseAchievementContext<AchievementType.GHOST>) {
        super({
            context,
            achievementType: AchievementType.GHOST
        });
    }

    async progress(context: AchievementTypeContext[AchievementType.GHOST]) {
        const { member, channel } = context;

        if (channel.id === member.guild.afkChannelId || !member.voice.channel)
            return;

        // Invisible members have no cached presence, so missing presence means offline
        if (!["invisible", "offline"].includes(member.presence?.status ?? "offline"))
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

import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { delay } from "@/utils/delay";
import { BaseAchievement, BaseAchievementContext } from "../structures/BaseAchievement";

// When Discord starts and rejoins voice on its own, the voice state arrives before the presence,
// so right after joining a member who is online can still look offline
const verificationDelayMs = 5000;

export class Ghost extends BaseAchievement<AchievementType.GHOST> {
    emoji = "👻";
    emojiImage = "https://em-content.zobj.net/source/microsoft/74/ghost_1f47b.png";

    constructor(context?: BaseAchievementContext<AchievementType.GHOST>) {
        super({
            context,
            achievementType: AchievementType.GHOST
        });
    }

    async progress(context: AchievementTypeContext[AchievementType.GHOST]) {
        const { member, channel } = context;

        if (this.level !== 0 || channel.id === member.guild.afkChannelId)
            return;

        // member.voice and member.presence read the live caches, so they are current after the wait
        await delay(verificationDelayMs);
        if (!member.voice.channel || member.voice.channelId === member.guild.afkChannelId)
            return;

        // Invisible members have no cached presence, so missing presence means offline
        if (!["invisible", "offline"].includes(member.presence?.status ?? "offline"))
            return;

        return this.setLevel(1)
            .then(() => ({
                leveledUp: true,
                change: 1
            }));
    }
}

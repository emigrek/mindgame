import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class Sleeper extends GradualAchievement<AchievementType.SLEEPER> {
    emoji = "😴";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/sleeping-face_1f634.png";
    // One move to AFK is a nap, the first level takes a habit
    levels = [5, 15, 30, 50, 100]
        .map((moves, index) => ({ value: moves, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.SLEEPER>) {
        super({ context, achievementType: AchievementType.SLEEPER });
    }

    // Moves from another voice channel into the AFK channel, by Discord's idle timeout or by someone else.
    // ponytail: a member moving themselves counts too, voice state updates don't say who moved them
    async progress(context: AchievementTypeContext[AchievementType.SLEEPER]) {
        const { member, channel } = context;
        if (channel.id !== member.guild.afkChannelId)
            return;

        const count = (this.payload?.count || 0) + 1;
        await this.updatePayload({ count });
        return this.reach(count);
    }
}

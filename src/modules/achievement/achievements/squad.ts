import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { formatDuration } from "@/utils/date";
import { ActivityType, GuildMember } from "discord.js";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const minute = 1000 * 60;
const hour = minute * 60;
// Others in the channel playing the same game, so a squad is at least three
const minTeammates = 2;

const playing = (member: GuildMember) =>
    member.presence?.activities.filter(activity => activity.type === ActivityType.Playing).map(activity => activity.name) ?? [];

export class Squad extends GradualAchievement<AchievementType.SQUAD> {
    emoji = "🎮";
    emojiImage = "https://em-content.zobj.net/source/microsoft/209/video-game_1f3ae.png";
    levels = [5, 10, 25, 50, 100, 250, 500]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.SQUAD>) {
        super({ context, achievementType: AchievementType.SQUAD });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.SQUAD]) {
        return { ms: formatDuration(payload.ms || 0) };
    }

    // Voice time with teammates in the channel playing the same game, read from the presences.
    // ponytail: credited a minute per experience tick, like voice EXP, so a skipped tick is a lost minute
    async progress(context: AchievementTypeContext[AchievementType.SQUAD]) {
        const { member, others } = context;
        const squad = playing(member)
            .some(game => others.filter(other => playing(other).includes(game)).length >= minTeammates);
        if (!squad)
            return;

        const ms = (this.payload?.ms || 0) + minute;
        await this.updatePayload({ ms });
        return this.reach(ms);
    }
}

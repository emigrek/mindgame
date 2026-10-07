import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import moment from "moment";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

export class Regular extends GradualAchievement<AchievementType.REGULAR> {
    emoji = "🪑";
    // Long-time members jump several levels on first check, only anniversaries are announced
    announceLevelJumps = false;
    levels = [6, 12, 24, 36, 48, 60, 72, 84, 96, 120]
        .map((months, index) => ({ value: months, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.REGULAR>) {
        super({ context, achievementType: AchievementType.REGULAR });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.REGULAR]) {
        return { joinedAtUnix: moment(payload.joinedAt).unix() };
    }

    // Months since joining the guild
    async progress(context: AchievementTypeContext[AchievementType.REGULAR]) {
        const { joinedAt } = context.member;
        if (!joinedAt)
            return;

        if (this.payload?.joinedAt?.getTime() !== joinedAt.getTime())
            await this.updatePayload({ joinedAt });

        return this.reach(moment().diff(joinedAt, "months"));
    }
}

import { AchievementType } from "@/interfaces";
import { GradualAchievement } from "@/modules/achievement/structures";

export class CoordinatedAction extends GradualAchievement<AchievementType.COORDINATED_ACTION> {
    achievementType = AchievementType.COORDINATED_ACTION;
    emoji = "🙏";

    levels = [
        {
            value: 1000 * 60 * 10,
            level: 1
        },
        {
            value: 1000 * 60 * 5,
            level: 2
        },
        {
            value: 1000 * 60 * 2,
            level: 3
        },
        {
            value: 1000 * 60,
            level: 4
        },
        {
            value: 1000 * 15,
            level: 5
        },
        {
            value: 1000 * 5,
            level: 6
        },
        {
            value: 1000 * 1,
            level: 7
        },
        {
            value: 1000 * 0.5,
            level: 8
        },
        {
            value: 1000 * 0.25,
            level: 9
        }
    ];

    async progress() {
        if (!this.context)
            throw new Error("The achievement's context must be provided to progress.");

        const { first, second } = this.context;
        const diff = Math.abs(second.from.getTime() - first.from.getTime());
        const threshold = this.findClosestLevelThreshold(diff);

        if (!threshold || threshold.level <= this.level) 
            return { leveledUp: false, change: 0 };

        return this.updatePayload({ ms: diff, withUserId: first.userId })
            .then(() => this.setLevel(threshold.level))
            .then(() => ({ leveledUp: true, change: threshold.level - this.level }));
    }
}


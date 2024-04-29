import { AchievementType, ProgressThreshold } from "@/interfaces";
import { BaseAchievement } from "./BaseAchievement";

export abstract class GradualAchievement<T extends AchievementType> extends BaseAchievement<T> {
    thresholds: ProgressThreshold[];

    constructor() {
        super();
        this.thresholds = [];
    }

    getThreshold({ value, level}: { value: number, level: number }): ProgressThreshold {
        return this.thresholds.find((threshold) => threshold.value >= value && threshold.level > level) || {
            value: 0,
            level: 0
        };
    }
}
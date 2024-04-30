import { AchievementType, AchievementTypePayload } from "@/interfaces";
import { BaseAchievement, ProgressResult } from "./BaseAchievement";

export abstract class LinearAchievement<T extends AchievementType> extends BaseAchievement<T> {
    formula: (level: number, payload: AchievementTypePayload[T]) => ProgressResult;

    constructor() {
        super();
        this.formula = () => ({ leveledUp: false, change: 0 });
    }
}
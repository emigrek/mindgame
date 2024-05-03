import { AchievementType, AchievementTypePayload } from "@/interfaces";
import { BaseAchievement, BaseAchievementParams, ProgressResult } from "./BaseAchievement";

export abstract class LinearAchievement<T extends AchievementType> extends BaseAchievement<T> {
    formula: (payload: AchievementTypePayload[T]) => ProgressResult;

    constructor(params: BaseAchievementParams<T>) {
        super(params);
        this.formula = () => ({ leveledUp: false, change: 0 });
    }
}
import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { BaseAchievement, ProgressResult } from "./BaseAchievement";

export abstract class LinearAchievement<T extends AchievementType> extends BaseAchievement<T> {
    formula: (payload: AchievementTypePayload[T]) => ProgressResult;

    constructor(context?: AchievementTypeContext[T]) {
        super(context);
        this.formula = () => ({ leveledUp: false, change: 0 });
    }
}
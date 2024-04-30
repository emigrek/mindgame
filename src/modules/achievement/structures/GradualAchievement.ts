import { AchievementType, ProgressThreshold } from '@/interfaces';
import { BaseAchievement } from './BaseAchievement';

export abstract class GradualAchievement<T extends AchievementType> extends BaseAchievement<T> {
    thresholds: ProgressThreshold[];

    constructor() {
        super();
        this.thresholds = [];
    }

    findClosestThreshold(value: number): ProgressThreshold {
        return this.thresholds.reduce((prev, curr) => {
            return (Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev);
        });
    }
}
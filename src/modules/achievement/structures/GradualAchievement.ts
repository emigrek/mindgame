import { AchievementType, LevelThreshold } from '@/interfaces';
import { BaseAchievement } from './BaseAchievement';

export abstract class GradualAchievement<T extends AchievementType> extends BaseAchievement<T> {
    levels: LevelThreshold[];

    constructor() {
        super();
        this.levels = [];
    }

    findClosestLevelThreshold(value: number): LevelThreshold {
        return this.levels.reduce((prev, curr) => {
            return (Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev);
        });
    }
}
import { AchievementType, LevelThreshold } from '@/interfaces';
import { BaseAchievement, BaseAchievementParams } from './BaseAchievement';

export abstract class GradualAchievement<T extends AchievementType> extends BaseAchievement<T> {
    levels: LevelThreshold[];

    constructor(params: BaseAchievementParams<T>) {
        super(params);
        this.levels = [];
    }

    findClosestLevelThreshold(value: number): LevelThreshold | undefined {
        let threshold = undefined;

        for (const level of this.levels) {
            if (value >= level.value) {
                threshold = level;
            }
        }
        
        return threshold;
    }
}
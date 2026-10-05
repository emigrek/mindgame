import { AchievementType, LevelThreshold } from '@/interfaces';
import { BaseAchievement, ProgressResult } from './BaseAchievement';

export abstract class GradualAchievement<T extends AchievementType> extends BaseAchievement<T> {
    levels: LevelThreshold[] = [];
    // When true, lower values reach higher levels (e.g. reaction time)
    lowerIsBetter = false;

    findClosestLevelThreshold(value: number): LevelThreshold | undefined {
        return this.levels
            .filter(threshold => this.lowerIsBetter ? value <= threshold.value : value >= threshold.value)
            .reduce<LevelThreshold | undefined>((best, threshold) => !best || threshold.level > best.level ? threshold : best, undefined);
    }

    async reach(value: number): Promise<ProgressResult | undefined> {
        const threshold = this.findClosestLevelThreshold(value);
        if (!threshold || threshold.level <= this.level)
            return;

        const change = threshold.level - this.level;
        await this.setLevel(threshold.level);
        return { leveledUp: true, change };
    }
}

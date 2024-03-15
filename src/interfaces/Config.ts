import { ExperienceCalculatorConfig } from "./ExperienceCalculatorConfig";
import { VoiceActivityStreak } from "./VoiceActivityStreak";

export interface Config {
    experienceConstant: number;
    experienceCalculatorConfig: ExperienceCalculatorConfig;
    dailyRewardExperience: number;

    userLongBreakHours: number;

    emptyGuildSweepTimeoutMs: number;
    emptyGuildSweepBotPrefixesList: string[];

    autoPutSlashCommands: boolean;

    voiceSignificantActivityStreakReward: number;
    voiceSignificantActivityStreakFormula: (streak: number) => VoiceActivityStreak;
}
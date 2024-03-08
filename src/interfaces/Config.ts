import { ExperienceCalculatorConfig } from "./ExperienceCalculatorConfig";

export interface Config {
    experienceConstant: number;
    experienceCalculatorConfig: ExperienceCalculatorConfig;
    dailyRewardExperience: number;

    userLongBreakHours: number;

    emptyGuildSweepTimeoutMs: number;
    emptyGuildSweepBotPrefixesList: string[];

    autoPutSlashCommands: boolean;
}
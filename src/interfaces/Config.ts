import {ExperienceCalculatorConfig} from "./ExperienceCalculatorConfig";
import {Streak, VoiceActivityStreak} from "./VoiceActivityStreak";

export interface VoiceActivityStreakLogicProps {
    streak?: Streak;
    maxStreak?: Streak;
}

export interface Config {
    enableVoiceExperienceReward: boolean;
    enablePresenceExperienceReward: boolean;
    enableMessageExperienceReward: boolean;

    experienceConstant: number;
    experienceCalculatorConfig: ExperienceCalculatorConfig;

    dailyRewardExperience: number;

    userLongBreakHours: number;

    emptyGuildSweepTimeoutMs: number;
    emptyGuildSweepBotPrefixesList: string[];

    autoPutSlashCommands: boolean;

    voiceSignificantActivityStreakReward: number;
    voiceActivityStreakLogic: (props: VoiceActivityStreakLogicProps) => VoiceActivityStreak;
}
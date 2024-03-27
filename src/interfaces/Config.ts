import {ExperienceConfig} from "./ExperienceConfig";
import {ActivityStreak, Streak} from "./ActivityStreak";

export interface StreakLogicProps {
    streak?: Streak;
    maxStreak?: Streak;
}

export interface Config {
    experience: ExperienceConfig;

    userLongBreakHours: number;

    emptyGuildSweepTimeoutMs: number;
    emptyGuildSweepBotPrefixesList: string[];

    autoPutSlashCommands: boolean;

    voiceActivityStreakLogic: (props: StreakLogicProps) => ActivityStreak;
}
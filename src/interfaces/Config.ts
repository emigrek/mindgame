import {ExperienceConfig} from "./ExperienceConfig";
import {ActivityStreak, Streak} from "./ActivityStreak";

export interface StreakLogicProps {
    streak?: Streak;
    maxStreak?: Streak;
}

export type InviteNotificationConfig = {
    enabled: boolean;
    chance: number;
};

export interface Config {
    experience: ExperienceConfig;

    userLongBreakHours: number;

    emptyGuildSweepTimeoutMs: number;
    emptyGuildSweepBotPrefixesList: string[];

    autoPutSlashCommands: boolean;

    inviteNotification: InviteNotificationConfig;

    voiceActivityStreakLogic: (props: StreakLogicProps) => ActivityStreak;
}
import { ActivityStreak, Streak } from "./ActivityStreak";
import { ExperienceConfig } from "./ExperienceConfig";

export interface StreakLogicProps {
    streak?: Streak;
    maxStreak?: Streak;
}

export type InviteNotificationConfig = {
    enabled: boolean;
    chance: number;
};

export type AchievementsConfig = {
    enabled: boolean;
}

export interface Config {
    experience: ExperienceConfig;

    achievements: AchievementsConfig;

    userLongBreakHours: number;

    emptyGuildSweepTimeoutMs: number;
    emptyGuildSweepBotPrefixesList: string[];

    autoPutSlashCommands: boolean;

    inviteNotification: InviteNotificationConfig;

    voiceActivityStreakLogic: (props: StreakLogicProps) => ActivityStreak;
}
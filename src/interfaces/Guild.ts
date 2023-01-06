export interface Guild {
    guildId: string;
    notifications: boolean;
    autoSweeping: boolean;
    levelRoles: boolean;
    levelRolesHoist: boolean;
    statisticsNotification: boolean;
    channelId: string | null;
    locale: string;
}
export interface Guild {
    guildId: string;
    notifications: boolean;
    autoSweeping: boolean;
    levelRoles: boolean;
    levelRolesHoist: boolean;
    channelId: string | null;
}
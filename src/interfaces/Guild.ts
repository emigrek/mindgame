export interface Guild {
    guildId: string;
    notifications: boolean;
    levelRoles: boolean;
    levelRolesHoist: boolean;
    channelId: string | null;
    locale: string;
}
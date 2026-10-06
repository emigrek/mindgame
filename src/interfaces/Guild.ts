export interface Guild {
    guildId: string;
    notifications: boolean;
    autoSweeping: boolean;
    levelRoles: boolean;
    levelRolesHoist: boolean;
    // Roles are tracked by ID so admins can rename them freely
    levelRoleIds: Map<string, string>; // threshold level -> role ID
    colorRoleIds: Map<string, string>; // user ID -> role ID
    channelId: string | null;
}
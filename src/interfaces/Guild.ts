export interface Guild {
    guildId: string;
    notifications: boolean;
    channelId: string | null;
    locale: string;
}
export interface PresenceActivity {
    userId: string;
    guildId: string;
    from: Date;
    to: Date | null;
    status: string;
    clientStatus: {
        desktop: string | null;
        mobile: string | null;
        web: string | null;
    }
}
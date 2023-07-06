export interface PresenceActivity {
    userId: string;
    guildId: string;
    from: Date;
    to: Date | null;
    status: string;
    client: string;
}
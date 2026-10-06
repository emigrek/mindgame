export interface PresenceActivity {
    userId: string;
    guildId: string;
    from: Date;
    to: Date | null;
    // Last experience tick that saw the session open
    lastSeenAt?: Date;
    status: string;
    client: string;
}
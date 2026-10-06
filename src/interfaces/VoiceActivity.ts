export interface VoiceActivity {
    userId: string;
    channelId: string;
    guildId: string;
    voiceStateId: string;
    streaming: boolean;
    from: Date;
    to: Date | null;
    // Last experience tick that saw the session open
    lastSeenAt?: Date;
}
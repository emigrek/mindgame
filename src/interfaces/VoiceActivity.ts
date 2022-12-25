export interface VoiceActivity {
    userId: string;
    channelId: string;
    guildId: string;
    voiceStateId: string;
    streaming: boolean;
    from: Date;
    to: Date | null;
}
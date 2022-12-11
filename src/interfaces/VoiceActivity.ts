export interface VoiceActivity {
    userId: string;
    channelId: string;
    voiceStateId: string;
    from: Date;
    to: Date | null;
}
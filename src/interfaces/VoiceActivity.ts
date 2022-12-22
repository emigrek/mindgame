export interface VoiceActivity {
    userId: string;
    channelId: string;
    voiceStateId: string;
    streaming: boolean;
    from: Date;
    to: Date | null;
}
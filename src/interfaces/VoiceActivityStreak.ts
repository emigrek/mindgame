export interface VoiceActivityStreak {
    streak: number;
    maxStreak: number;
    isSignificant: boolean;
    nextSignificant: number;
}
export interface VoiceActivityStreak {
    streak?: Streak;
    maxStreak?: Streak;
    isSignificant: boolean;
    nextSignificant: number;
}

export interface Streak {
    value: number,
    date: Date,
    startedAt: Date,
}
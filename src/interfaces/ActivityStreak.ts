export interface ActivityStreak {
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
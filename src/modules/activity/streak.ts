import type { Streak } from "@/interfaces/ActivityStreak";

// Voice streaks count Europe/Warsaw calendar days, passed around as "YYYY-MM-DD" keys.
// Day numbers go through UTC, so DST changes and year boundaries don't break the "+1 day" check.
const dayNumber = (day: string) => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) / 86_400_000;
// Noon UTC falls on the same calendar day wherever the date gets displayed
const dayToDate = (day: string) => new Date(`${day}T12:00:00Z`);

interface DayStreak {
    value: number;
    startedAt: string;
    date: string;
}

const toStreak = ({ value, startedAt, date }: DayStreak): Streak => ({ value, startedAt: dayToDate(startedAt), date: dayToDate(date) });

// days: unique day keys, oldest first
export const computeStreaks = (days: string[], today: string): { streak?: Streak; maxStreak?: Streak } => {
    let current: DayStreak | undefined;
    let max: DayStreak | undefined;

    for (const day of days) {
        current = current && dayNumber(day) - dayNumber(current.date) === 1
            ? { ...current, value: current.value + 1, date: day }
            : { value: 1, startedAt: day, date: day };
        if (!max || current.value > max.value) max = current;
    }

    if (!current || !max) return {};

    // A streak only lasts while its last day is today or yesterday
    const expired = dayNumber(today) - dayNumber(current.date) > 1;
    return {
        streak: expired ? { value: 0, startedAt: dayToDate(today), date: dayToDate(today) } : toStreak(current),
        maxStreak: toStreak(max),
    };
};

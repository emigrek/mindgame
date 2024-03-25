import mongoose from "mongoose";

export enum SortingTypes {
    EXP = "experience",
    VOICE = "voice time",
    MESSAGES = "messages",
}

export enum SortingRanges {
    TOTAL = "total",
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
}

type SortValues = Record<string, 1 | -1 | mongoose.Expression.Meta>;

export interface Sorting {
    type: SortingTypes;
    range: SortingRanges;
    sort: SortValues;
    mask: string;
    emoji: string;
}
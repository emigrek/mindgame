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

type SortValues = { [key: string]: mongoose.SortOrder | { $meta: "textScore"; } };

export interface Sorting {
    type: SortingTypes;
    range: SortingRanges;
    sort: SortValues;
    mask: string;
    emoji: string;
}
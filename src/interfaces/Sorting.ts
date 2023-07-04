import mongoose from "mongoose";

type SortValues = { [key: string]: mongoose.SortOrder | { $meta: "textScore"; } };

export interface Sorting {
    type: string;
    label: string;
    range: 'total' | 'day' | 'week' | 'month';
    sort: SortValues;
    mask: string;
    emoji: string;
}
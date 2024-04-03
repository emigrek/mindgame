import ExtendedClient from "@/client/ExtendedClient";
import {Sorting, SortingRanges, SortingTypes} from "@/interfaces";
import {UserGuildStatistics} from "@/interfaces/UserGuildStatistics";

export const getSortingByType = (type: SortingTypes, range: SortingRanges): Sorting => {
    return sortings.find(s => s.type === type && s.range === range) as Sorting;
};

export const runMask = (client: ExtendedClient, mask: string, userGuildStatistics: UserGuildStatistics): string => {
    const { total, level, day, week, month } = userGuildStatistics;
    return mask
        .replace("{total.level}", level.toString())
        .replace("{total.commands}", total.commands.toString())
        .replace("{total.exp}", client.numberFormat.format(total.exp).toString())
        .replace("{day.exp}", client.numberFormat.format(day.exp).toString())
        .replace("{week.exp}", client.numberFormat.format(week.exp).toString())
        .replace("{month.exp}", client.numberFormat.format(month.exp).toString())
        .replace("{total.messages}", total.messages.toString())
        .replace("{day.messages}", day.messages.toString())
        .replace("{week.messages}", week.messages.toString())
        .replace("{month.messages}", month.messages.toString())
        .replace("{total.time.voice}", Math.round(total.time.voice/3600).toString())
        .replace("{day.time.voice}", Math.round(day.time.voice/3600).toString())
        .replace("{week.time.voice}", Math.round(week.time.voice/3600).toString())
        .replace("{month.time.voice}", Math.round(month.time.voice/3600).toString());
};

export const sortings: Sorting[] = [
    {
        type: SortingTypes.EXP,
        range: SortingRanges.TOTAL,
        sort: { "total.exp": -1 },
        mask: "{total.level} LVL\n({total.exp} EXP)",
        emoji: "✨"
    },
    {
        type: SortingTypes.EXP,
        range: SortingRanges.DAY,
        sort: { "day.exp": -1 },
        mask: "{day.exp} EXP",
        emoji: "✨"
    },
    {
        type: SortingTypes.EXP,
        range: SortingRanges.WEEK,
        sort: { "week.exp": -1 },
        mask: "{week.exp} EXP",
        emoji: "✨"
    },
    {
        type: SortingTypes.EXP,
        range: SortingRanges.MONTH,
        sort: { "month.exp": -1 },
        mask: "{month.exp} EXP",
        emoji: "✨"
    },
    {
        type: SortingTypes.VOICE,
        range: SortingRanges.TOTAL,
        sort: { "total.time.voice": -1 },
        mask: "{total.time.voice}H",
        emoji: "⌛"
    },
    {
        type: SortingTypes.VOICE,
        range: SortingRanges.DAY,
        sort: { "day.time.voice": -1 },
        mask: "{day.time.voice}H",
        emoji: "⌛"
    },
    {
        type: SortingTypes.VOICE,
        range: SortingRanges.WEEK,
        sort: { "week.time.voice": -1 },
        mask: "{week.time.voice}H",
        emoji: "⌛"
    },
    {
        type: SortingTypes.VOICE,
        range: SortingRanges.MONTH,
        sort: { "month.time.voice": -1 },
        mask: "{month.time.voice}H",
        emoji: "⌛"
    },
    {
        type: SortingTypes.MESSAGES,
        range: SortingRanges.TOTAL,
        sort: { "total.messages": -1 },
        mask: "{total.messages}",
        emoji: "💬"
    },
    {
        type: SortingTypes.MESSAGES,
        range: SortingRanges.DAY,
        sort: { "day.messages": -1 },
        mask: "{day.messages}",
        emoji: "💬"
    },
    {
        type: SortingTypes.MESSAGES,
        range: SortingRanges.WEEK,
        sort: { "week.messages": -1 },
        mask: "{week.messages}",
        emoji: "💬"
    },
    {
        type: SortingTypes.MESSAGES,
        range: SortingRanges.MONTH,
        sort: { "month.messages": -1 },
        mask: "{month.messages}",
        emoji: "💬"
    },
];
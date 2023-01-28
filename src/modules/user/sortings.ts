import mongoose from "mongoose";
import ExtendedClient from "../../client/ExtendedClient";
import { User as DatabaseUser } from "../../interfaces";
import { Sorting } from "../../interfaces/Sorting";

export const getSortingByType = (type: string): Sorting => {
    return sortings.find(s => s.type === type) ?? sortings[0];
};

export const runMask = (client: ExtendedClient, mask: string, user: DatabaseUser & mongoose.Document): string => {
    return mask
        .replace("{stats.exp}", client.numberFormat.format(user.stats.exp).toString())
        .replace("{stats.games.won.skill}", user.stats.games.won.skill.toString())
        .replace("{stats.games.won.skin}", user.stats.games.won.skin.toString())
        .replace("{stats.commands}", user.stats.commands.toString())
        .replace("{day.exp}", client.numberFormat.format(user.day.exp).toString())
        .replace("{day.time.voice}", Math.round(user.day.time.voice/3600).toString())
        .replace("{week.exp}", client.numberFormat.format(user.week.exp).toString())
        .replace("{week.time.voice}", Math.round(user.week.time.voice/3600).toString())
        .replace("{month.exp}", client.numberFormat.format(user.month.exp).toString())
        .replace("{month.time.voice}", Math.round(user.month.time.voice/3600).toString())
};
export const sortings: Sorting[] = [
    {
        type: "exp",
        label: "Experience",
        range: "total",
        value: { "stats.exp": -1 },
        mask: "{stats.exp} EXP"
    },
    {
        type: "skill",
        label: "Skill games won",
        range: "total",
        value: { "stats.games.won.skill": -1 },
        mask: "{stats.games.won.skill}"
    },
    {
        type: "skin",
        label: "Skin games won",
        range: "total",
        value: { "stats.games.won.skin": -1 },
        mask: "{stats.games.won.skin}"
    },
    {
        type: "commands",
        label: "Commands used",
        range: "total",
        value: { "stats.commands": -1 },
        mask: "{stats.commands} executed"
    },
    {
        type: "day exp",
        label: "Experience",
        range: "day",
        value: { "day.exp": -1 },
        mask: "{day.exp} EXP"
    },
    {
        type: "day voice",
        label: "Voice time",
        range: "day",
        value: { "day.time.voice": -1 },
        mask: "{day.time.voice}H"
    },
    {
        type: "week exp",
        label: "Experience",
        range: "week",
        value: { "week.exp": -1 },
        mask: "{week.exp} EXP"
    },
    {
        type: "week voice",
        label: "Voice time",
        range: "week",
        value: { "week.time.voice": -1 },
        mask: "{week.time.voice}H"
    },
    {
        type: "month exp",
        label: "Experience",
        range: "month",
        value: { "month.exp": -1 },
        mask: "{month.exp} EXP"
    },
    {
        type: "month voice",
        label: "Voice time",
        range: "month",
        value: { "month.time.voice": -1 },
        mask: "{month.time.voice}H"
    }
];
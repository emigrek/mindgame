import mongoose from "mongoose";
import ExtendedClient from "../../client/ExtendedClient";
import { User as DatabaseUser } from "../../interfaces";
import { Sorting } from "../../interfaces/Sorting";

export const getSortingByType = (type: string): Sorting => {
    return sortings.find(s => s.type === type) ?? sortings[0];
};

export const runMask = (client: ExtendedClient, mask: string, user: DatabaseUser & mongoose.Document): string => {
    return mask
        .replace("{stats.commands}", user.stats.commands.toString())
        .replace("{stats.level}", user.stats.level.toString())
        .replace("{stats.exp}", client.numberFormat.format(user.stats.exp).toString())
        .replace("{stats.games.won.skill}", user.stats.games.won.skill.toString())
        .replace("{stats.games.won.skin}", user.stats.games.won.skin.toString())
        .replace("{day.exp}", client.numberFormat.format(user.day.exp).toString())
        .replace("{day.time.voice}", Math.round(user.day.time.voice/3600).toString())
        .replace("{day.games.won.skill}", user.day.games.won.skill.toString())
        .replace("{day.games.won.skin}", user.day.games.won.skin.toString())
        .replace("{week.exp}", client.numberFormat.format(user.week.exp).toString())
        .replace("{week.time.voice}", Math.round(user.week.time.voice/3600).toString())
        .replace("{week.games.won.skill}", user.week.games.won.skill.toString())
        .replace("{week.games.won.skin}", user.week.games.won.skin.toString())
        .replace("{month.exp}", client.numberFormat.format(user.month.exp).toString())
        .replace("{month.time.voice}", Math.round(user.month.time.voice/3600).toString())
        .replace("{month.games.won.skill}", user.month.games.won.skill.toString())
        .replace("{month.games.won.skin}", user.month.games.won.skin.toString())
};
export const sortings: Sorting[] = [
    {
        type: "exp",
        label: "Experience",
        range: "total",
        value: { "stats.exp": -1 },
        mask: "{stats.level} LVL ({stats.exp} EXP)"
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
        type: "day skill",
        label: "Skill games won",
        range: "day",
        value: { "day.games.won.skill": -1 },
        mask: "{day.games.won.skill}"
    },
    {
        type: "day skin",
        label: "Skin games won",
        range: "day",
        value: { "day.games.won.skin": -1 },
        mask: "{day.games.won.skin}"
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
        type: "week skill",
        label: "Skill games won",
        range: "week",
        value: { "day.games.won.skill": -1 },
        mask: "{day.games.won.skill}"
    },
    {
        type: "week skin",
        label: "Skin games won",
        range: "week",
        value: { "week.games.won.skin": -1 },
        mask: "{week.games.won.skin}"
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
    },
    {
        type: "month skill",
        label: "Skill games won",
        range: "month",
        value: { "month.games.won.skill": -1 },
        mask: "{month.games.won.skill}"
    },
    {
        type: "month skin",
        label: "Skin games won",
        range: "month",
        value: { "month.games.won.skin": -1 },
        mask: "{month.games.won.skin}"
    }
];
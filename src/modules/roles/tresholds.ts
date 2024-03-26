import { ColorResolvable } from "discord.js";

export interface LevelTreshold {
    level: number;
    color: ColorResolvable;
}

export const levelTresholds: LevelTreshold[] = [
    {
        level: 200,
        color: "#3be8ff"
    },
    {
        level: 160,
        color: "#d94444"
    },
    {
        level: 120,
        color: "#9d48e0"
    },
    {
        level: 90,
        color: "#748df9"
    },
    {
        level: 60,
        color: "#72ba88"
    },
    {
        level: 30,
        color: "#f1a64e"
    },
    {
        level: 20,
        color: "#9ebec7"
    },
    {
        level: 10,
        color: "#b6775e"
    },
    {
        level: 0,
        color: "#817678"
    }
];
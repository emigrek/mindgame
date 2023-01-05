import { ColorResolvable, PermissionResolvable } from "discord.js";
import { PermissionFlagsBits } from "discord.js";

export interface LevelTreshold {
    level: number;
    color: ColorResolvable;
    permissions: PermissionResolvable;
};

export const levelTresholds: LevelTreshold[] = [
    {
        "level": 200,
        "color": "#3be8ff",
        "permissions": [PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.MoveMembers]
    },
    {
        "level": 160,
        "color": "#d94444",
        "permissions": [PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.MoveMembers]
    },
    {
        "level": 120,
        "color": "#9d48e0",
        "permissions": [PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.MoveMembers]
    },
    {
        "level": 90,
        "color": "#748df9",
        "permissions": [PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.MoveMembers]
    },
    {
        "level": 60,
        "color": "#72ba88",
        "permissions": [PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.MoveMembers]
    },
    {
        "level": 30,
        "color": "#f1a64e",
        "permissions": [PermissionFlagsBits.CreateInstantInvite]
    },
    {
        "level": 20,
        "color": "#9ebec7",
        "permissions": [PermissionFlagsBits.CreateInstantInvite]
    },
    {
        "level": 10,
        "color": "#b6775e",
        "permissions": [PermissionFlagsBits.CreateInstantInvite]
    },
    {
        "level": 0,
        "color": "#817678",
        "permissions": [PermissionFlagsBits.CreateInstantInvite]
    }
];
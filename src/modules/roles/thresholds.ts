import {Collection, ColorResolvable, Role} from "discord.js";

export interface LevelThreshold {
    level: number;
    color: ColorResolvable;
}

export const levelThresholds: LevelThreshold[] = [
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

// Threshold level -> role ID. Roles are tracked by ID, so admins can rename them freely.
export type LevelRoleIds = Map<string, string>;

type NamedRole = Pick<Role, "id" | "name" | "hexColor">;

// Level roles used to be matched by the number in their name. This maps them to IDs once per guild.
// ponytail: picks the only match, else exact "Level N", else the threshold color; ambiguous levels are skipped and recreated on demand
export const adoptLegacyLevelRoles = (roles: Collection<string, NamedRole>): LevelRoleIds => {
    const levelRoleIds: LevelRoleIds = new Map();
    for (const { level, color } of levelThresholds) {
        const adoptedRoleIds = [...levelRoleIds.values()];
        const candidates = roles.filter(role => new RegExp(`\\b${level}\\b`).test(role.name) && !adoptedRoleIds.includes(role.id));
        const role = candidates.size === 1
            ? candidates.first()
            : candidates.find(role => role.name === `Level ${level}`) ?? candidates.find(role => role.hexColor === color);

        if (role)
            levelRoleIds.set(String(level), role.id);
        else if (candidates.size)
            console.log(`[Roles] Skipped ambiguous legacy level ${level} roles: ${candidates.map(role => role.name).join(", ")}`);
    }
    return levelRoleIds;
}

// True when the level-up reached or skipped past a role threshold (e.g. 9 -> 11 crosses 10)
export const crossesLevelThreshold = (oldLevel: number, newLevel: number) =>
    levelThresholds.some(t => t.level > oldLevel && t.level <= newLevel);

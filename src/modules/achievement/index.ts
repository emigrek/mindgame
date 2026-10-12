import { AchievementType } from "@/interfaces";
import type { BaseAchievement } from "./structures/BaseAchievement";
import { Collector, Comeback, CoordinatedAction, DJ, Ghost, Host, Inseparable, Marathon, NightOwl, Regular, Sleeper, Social, Squad, Streamer, Suss, UniqueReactions, WeeklyKing } from "./achievements";

export { achievementModel } from "./model";

// Fresh instances on every call, directed achievements hold per-user state
export const getAllAchievements = (): BaseAchievement<AchievementType>[] => [
    new UniqueReactions(),
    new CoordinatedAction(),
    new Suss(),
    new Streamer(),
    new Ghost(),
    new DJ(),
    new NightOwl(),
    new Marathon(),
    new Social(),
    new Host(),
    new Comeback(),
    new Regular(),
    new Sleeper(),
    new Inseparable(),
    new Squad(),
    new WeeklyKing(),
    new Collector(),
];

export * from "./structures";


import { AchievementType } from "@/interfaces";
import type { BaseAchievement } from "./structures/BaseAchievement";
import { Comeback, CoordinatedAction, DJ, Ghost, Host, Marathon, NightOwl, Regular, Social, Streamer, Suss, UniqueReactions } from "./achievements";

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
];

export * from "./structures";


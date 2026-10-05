import { AchievementType } from "@/interfaces";
import achievementSchema, { AchievementDocument } from "@/modules/schemas/Achievement";
import { model } from "mongoose";
import type { BaseAchievement } from "./structures/BaseAchievement";
import { CoordinatedAction, DJ, Ghost, Streamer, Suss, UniqueReactions } from "./achievements";

export const achievementModel = model<AchievementDocument<AchievementType>>('Achievement', achievementSchema);

export const allAchievements: BaseAchievement<AchievementType>[] = [
    // new UniqueReactions(),
    // new CoordinatedAction(),
    // new Suss(),
    // new Streamer(),
    // new Ghost(),
    // new DJ(),
];

export * from "./structures";


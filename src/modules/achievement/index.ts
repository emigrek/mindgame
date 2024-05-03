import { AchievementType } from "@/interfaces";
import achievementSchema, { AchievementDocument } from "@/modules/schemas/Achievement";
import { model } from "mongoose";
import { CoordinatedAction, Suss, UniqueReactions } from "./achievements";

export const achievementModel = model<AchievementDocument<AchievementType>>('Achievement', achievementSchema);

export const allAchievements = [
    new UniqueReactions(),
    new CoordinatedAction(),
    new Suss(),
];

export * from "./structures";

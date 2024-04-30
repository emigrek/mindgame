import { AchievementType } from "@/interfaces";
import achievementSchema, { AchievementDocument } from "@/modules/schemas/Achievement";
import { model } from "mongoose";

export const achievementModel = model<AchievementDocument<AchievementType>>('Achievement', achievementSchema);

export { AchievementManager } from "./achievementManager";

export * from "./structures";


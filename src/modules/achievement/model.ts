import { AchievementType } from "@/interfaces";
import achievementSchema, { AchievementDocument } from "@/modules/schemas/Achievement";
import { model } from "mongoose";

// Own module, so the achievement structures don't import ./index (which imports every achievement)
export const achievementModel = model<AchievementDocument<AchievementType>>('Achievement', achievementSchema);

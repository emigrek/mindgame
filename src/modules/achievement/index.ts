import mongoose from "mongoose";
import achievementSchema from "@/modules/schemas/Achievement";

const achievementModel = mongoose.model("Achievement", achievementSchema);

export { achievementModel };
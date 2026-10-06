import presenceActivitySchema from "@/modules/schemas/PresenceActivity";
import voiceActivitySchema from "@/modules/schemas/VoiceActivity";

import mongoose from "mongoose";

const isDuplicateKeyError = (e: unknown) => (e as { code?: number })?.code === 11000;
const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

export { isDuplicateKeyError, voiceActivityModel, presenceActivityModel };

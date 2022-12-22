import { GuildMember, Presence } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema from "../schemas/VoiceActivity";
import mongoose from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "../user";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);

export { voiceActivityModel };
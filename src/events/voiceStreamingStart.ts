import { Document } from "mongoose";
import { Event, VoiceActivity } from "../interfaces";
import { getVoiceActivity } from "../modules/activity";

export const voiceStreamingStart: Event = {
    name: "voiceStreamingStart",
    run: async (client, member, voiceChannel) => {
        const voiceActivity = await getVoiceActivity(member) as VoiceActivity & Document;
        if (!voiceActivity) return;
        
        voiceActivity.streaming = true;
        await voiceActivity.save();
    }
}
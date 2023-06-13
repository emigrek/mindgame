import { Document } from "mongoose";
import { Event, VoiceActivity } from "../interfaces";
import { getVoiceActivity } from "../modules/activity";

export const voiceStreamingStop: Event = {
    name: "voiceStreamingStop",
    run: async (client, member) => {
        const voiceActivity = await getVoiceActivity(member) as VoiceActivity & Document;
        if (!voiceActivity) return;
        
        voiceActivity.streaming = false;
        await voiceActivity.save();
    }
}
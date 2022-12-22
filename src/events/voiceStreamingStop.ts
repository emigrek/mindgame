import { Document } from "mongoose";
import { Event, VoiceActivity } from "../interfaces";
import { getVoiceActivity, startVoiceActivity } from "../modules/activity";

export const voiceStreamingStop: Event = {
    name: "voiceStreamingStop",
    run: async (client, member, voiceChannel) => {
        const voiceActivity = await getVoiceActivity(member) as VoiceActivity & Document;
        if (!voiceActivity) return;
        
        voiceActivity.streaming = false;
        await voiceActivity.save();
    }
}
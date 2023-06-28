import { Event } from "@/interfaces";
import { getVoiceActivity } from "@/modules/activity";

export const voiceStreamingStop: Event = {
    name: "voiceStreamingStop",
    run: async (client, member) => {
        const voiceActivity = await getVoiceActivity(member);
        if (!voiceActivity) return;
        
        voiceActivity.streaming = false;
        await voiceActivity.save();
    }
}
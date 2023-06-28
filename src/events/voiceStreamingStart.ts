import { Event } from "@/interfaces";
import { getVoiceActivity } from "@/modules/activity";

export const voiceStreamingStart: Event = {
    name: "voiceStreamingStart",
    run: async (client, member) => {
        const voiceActivity = await getVoiceActivity(member);
        if (!voiceActivity) return;
        
        voiceActivity.streaming = true;
        await voiceActivity.save();
    }
}
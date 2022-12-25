import { Event } from "../interfaces";
import { endVoiceActivity } from "../modules/activity";

export const voiceChannelDeaf: Event = {
    name: "voiceChannelDeaf",
    run: async (client, member, deafType) => {
        if(!member.voice.channel) return;
        
        await endVoiceActivity(client, member);
    }
}
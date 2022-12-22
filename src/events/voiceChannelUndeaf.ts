import { Event } from "../interfaces";
import { startVoiceActivity } from "../modules/activity";

export const voiceChannelUndeaf: Event = {
    name: "voiceChannelUndeaf",
    run: async (client, member, deafType) => {
        if (!member.voice.channel) return;
        await startVoiceActivity(client, member, member.voice.channel);
    }
}
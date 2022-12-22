import { Event } from "../interfaces";
import { endVoiceActivity } from "../modules/activity";

export const voiceChannelLeave: Event = {
    name: "voiceChannelLeave",
    run: async (client, member, channel) => {
        await endVoiceActivity(client, member, channel);
    }
}
import { Event } from "../interfaces";
import { startVoiceActivity } from "../modules/activity";

export const voiceChannelJoin: Event = {
    name: "voiceChannelJoin",
    run: async (client, member, channel) => {
        await startVoiceActivity(client, member, channel);
    }
}
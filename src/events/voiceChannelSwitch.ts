import { Event } from "../interfaces";
import { endVoiceActivity, startVoiceActivity } from "../modules/activity";

export const voiceChannelSwitch: Event = {
    name: "voiceChannelSwitch",
    run: async (client, member, oldChannel, newChannel) => {
        await endVoiceActivity(client, member, oldChannel);
        await startVoiceActivity(client, member, newChannel);
    }
}
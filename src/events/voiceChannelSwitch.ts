import { Event } from "@/interfaces";
import { getVoiceActivity, startVoiceActivity } from "@/modules/activity";

export const voiceChannelSwitch: Event = {
    name: "voiceChannelSwitch",
    run: async (client, member, oldChannel, newChannel) => {
        const activity = await getVoiceActivity(member);
        if (!activity) {
            await startVoiceActivity(client, member, newChannel);
            return;
        }

        activity.channelId = newChannel.id;
        await activity.save();
    }
}
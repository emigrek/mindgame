import { Event } from "@/interfaces";
import { checkVoiceChannelMembers, checkVoiceSessionStart } from "@/modules/achievement/achievements";
import { startVoiceActivity } from "@/modules/activity";

export const voiceChannelUndeaf: Event<"voiceChannelUndeaf"> = {
    name: "voiceChannelUndeaf",
    run: async (client, member) => {
        if (!member.voice.channel) return;

        const activity = await startVoiceActivity(client, member, member.voice.channel);
        
        if (activity) {
            await checkVoiceSessionStart(client, member, member.voice.channel, activity);
            checkVoiceChannelMembers(client, member, member.voice.channel);
        }
    }
}
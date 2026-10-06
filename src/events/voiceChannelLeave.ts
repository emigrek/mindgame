import { Event } from "@/interfaces";
import { checkVoiceChannelMembers, checkVoiceSessionEnd } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";

export const voiceChannelLeave: Event<"voiceChannelLeave"> = {
    name: "voiceChannelLeave",
    run: async (client, member, channel) => {
        const activity = await endVoiceActivity(member);
        await checkGuildVoiceEmpty(client, member.guild, channel);

        checkVoiceChannelMembers(client, member, channel);
        checkVoiceSessionEnd(client, { userId: member.id, guildId: member.guild.id }, activity);
    }
}
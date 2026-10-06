import { Event } from "@/interfaces";
import { checkVoiceChannelMembers, checkVoiceSessionEnd } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";

export const voiceChannelDeaf: Event<"voiceChannelDeaf"> = {
    name: "voiceChannelDeaf",
    run: async (client, member) => {
        const activity = await endVoiceActivity(member);
        checkVoiceSessionEnd(client, { userId: member.id, guildId: member.guild.id }, activity);

        if (member.voice.channel) {
            await checkGuildVoiceEmpty(client, member.guild, member.voice.channel);

            checkVoiceChannelMembers(client, member, member.voice.channel);
        }
    }
}
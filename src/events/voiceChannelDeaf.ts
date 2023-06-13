import { Event } from "../interfaces";
import { endVoiceActivity, getGuildActiveVoiceActivities } from "../modules/activity";

export const voiceChannelDeaf: Event = {
    name: "voiceChannelDeaf",
    run: async (client, member) => {
        if(!member.voice.channel) return;
        
        await endVoiceActivity(client, member);

        const activeVoiceActivities = await getGuildActiveVoiceActivities(member.guild);
        if(!activeVoiceActivities.length)
            client.emit("guildVoiceEmpty", member.guild, member.voice.channel);
    }
}
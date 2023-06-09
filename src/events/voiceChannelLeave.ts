import { Event } from "../interfaces";
import { endVoiceActivity, getGuildActiveVoiceActivities } from "../modules/activity";

export const voiceChannelLeave: Event = {
    name: "voiceChannelLeave",
    run: async (client, member, channel) => {
        await endVoiceActivity(client, member);

        const activeVoiceActivities = await getGuildActiveVoiceActivities(member.guild);
        if(!activeVoiceActivities.length) 
            client.emit("guildVoiceEmpty", member.guild, channel);
    }
}
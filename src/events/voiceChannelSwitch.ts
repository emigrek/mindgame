import { Event } from "@/interfaces";
import { endVoiceActivity, getVoiceActivity, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelSwitch: Event = {
    name: "voiceChannelSwitch",
    run: async (client, member: GuildMember, oldChannel: VoiceChannel, newChannel: VoiceChannel) => {
        const activity = await getVoiceActivity(member);
        if (!activity) {
            await startVoiceActivity(client, member, newChannel);
            return;
        }

        const { guild } = member;
        if(newChannel.id === guild.afkChannelId){
            await endVoiceActivity(client, member);
            return;
        }

        activity.channelId = newChannel.id;
        await activity.save();
    }
}
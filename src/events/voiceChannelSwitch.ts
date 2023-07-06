import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { checkGuildVoiceEmpty, endVoiceActivity, getVoiceActivity, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelSwitch: Event = {
    name: "voiceChannelSwitch",
    run: async (client: ExtendedClient, member: GuildMember, oldChannel: VoiceChannel, newChannel: VoiceChannel) => {
        const activity = await getVoiceActivity(member);
        if (!activity) {
            await startVoiceActivity(client, member, newChannel);
            return;
        }

        const { guild } = member;
        if(newChannel.id === guild.afkChannelId){
            await endVoiceActivity(client, member);
            await checkGuildVoiceEmpty(client, guild, oldChannel);
            return;
        }

        activity.channelId = newChannel.id;
        await activity.save();
        await checkGuildVoiceEmpty(client, guild, oldChannel);
    }
}
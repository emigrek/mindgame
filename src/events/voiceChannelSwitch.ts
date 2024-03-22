import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { checkGuildVoiceEmpty, endVoiceActivity, getVoiceActivity, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelSwitch: Event = {
    name: "voiceChannelSwitch",
    run: async (client: ExtendedClient, member: GuildMember, oldChannel: VoiceChannel, newChannel: VoiceChannel) => {
        const { guild } = member;

        const activity = await getVoiceActivity({ userId: member.id, guildId: guild.id });
        if (!activity) {
            await startVoiceActivity(client, member, newChannel);
            return;
        }

        if(newChannel.id === guild.afkChannelId){
            await endVoiceActivity(member);
            await checkGuildVoiceEmpty(client, guild, oldChannel);
            return;
        }

        activity.channelId = newChannel.id;
        await activity.save();
        await checkGuildVoiceEmpty(client, guild, oldChannel);
    }
}
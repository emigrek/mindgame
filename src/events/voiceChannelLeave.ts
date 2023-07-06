import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelLeave: Event = {
    name: "voiceChannelLeave",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        await endVoiceActivity(client, member);
        await checkGuildVoiceEmpty(client, member.guild, channel);
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { checkSuss } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceChannelDeaf: Event = {
    name: "voiceChannelDeaf",
    run: async (client: ExtendedClient, member: GuildMember) => {
        await endVoiceActivity(member);

        if (member.voice.channel) {
            await checkGuildVoiceEmpty(client, member.guild, member.voice.channel);

            checkSuss(client, member, member.voice.channel);
        }
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { checkVoiceChannelMembers, checkVoiceSessionEnd } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceChannelDeaf: Event = {
    name: "voiceChannelDeaf",
    run: async (client: ExtendedClient, member: GuildMember) => {
        const activity = await endVoiceActivity(member);
        checkVoiceSessionEnd(client, member, activity);

        if (member.voice.channel) {
            await checkGuildVoiceEmpty(client, member.guild, member.voice.channel);

            checkVoiceChannelMembers(client, member, member.voice.channel);
        }
    }
}
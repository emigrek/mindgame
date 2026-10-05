import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { checkVoiceChannelMembers, checkVoiceSessionEnd } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelLeave: Event = {
    name: "voiceChannelLeave",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        const activity = await endVoiceActivity(member);
        await checkGuildVoiceEmpty(client, member.guild, channel);

        checkVoiceChannelMembers(client, member, channel);
        checkVoiceSessionEnd(client, member, activity);
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { startVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceChannelUndeaf: Event = {
    name: "voiceChannelUndeaf",
    run: async (client: ExtendedClient, member: GuildMember) => {
        if (!member.voice.channel) return;
        await startVoiceActivity(client, member, member.voice.channel);
    }
}
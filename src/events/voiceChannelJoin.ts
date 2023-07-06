import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelJoin: Event = {
    name: "voiceChannelJoin",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        await startVoiceActivity(client, member, channel);
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceStreamingStop: Event = {
    name: "voiceStreamingStop",
    run: async (client: ExtendedClient, member: GuildMember) => {
        const voiceActivity = await getVoiceActivity(member);
        if (!voiceActivity) return;
        
        voiceActivity.streaming = false;
        await voiceActivity.save();
    }
}
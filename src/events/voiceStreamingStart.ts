import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceStreamingStart: Event = {
    name: "voiceStreamingStart",
    run: async (client: ExtendedClient, member: GuildMember) => {
        const voiceActivity = await getVoiceActivity(member);
        if (!voiceActivity) return;
        
        voiceActivity.streaming = true;
        await voiceActivity.save();
    }
}
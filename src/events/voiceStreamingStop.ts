import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Streamer } from "@/modules/achievement/achievements";
import { getVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceStreamingStop: Event = {
    name: "voiceStreamingStop",
    run: async (client: ExtendedClient, member: GuildMember) => {
        const voiceActivity = await getVoiceActivity({ userId: member.id, guildId: member.guild.id });
        if (voiceActivity) {
            voiceActivity.streaming = false;
            await voiceActivity.save();
        }

        if (member.voice.channel) {
            new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
                .check(
                    new Streamer({
                        channel: member.voice.channel,
                        member,
                        streaming: false
                    })
                );
        }
    }
}
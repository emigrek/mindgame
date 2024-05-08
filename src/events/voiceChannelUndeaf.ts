import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Suss } from "@/modules/achievement/achievements";
import { startVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceChannelUndeaf: Event = {
    name: "voiceChannelUndeaf",
    run: async (client: ExtendedClient, member: GuildMember) => {
        if (!member.voice.channel) return;

        const activity = await startVoiceActivity(client, member, member.voice.channel);
        
        if (activity) {
            new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
                .check(
                    new Suss({ member, channel: member.voice.channel })
                );
        }
    }
}
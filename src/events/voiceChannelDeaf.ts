import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Suss } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";
import { GuildMember } from "discord.js";

export const voiceChannelDeaf: Event = {
    name: "voiceChannelDeaf",
    run: async (client: ExtendedClient, member: GuildMember) => {
        await endVoiceActivity(member);

        if (member.voice.channel) {
            await checkGuildVoiceEmpty(client, member.guild, member.voice.channel);

            new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
                .check(
                    new Suss({ member, channel: member.voice.channel })
                );
        }
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Suss } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelLeave: Event = {
    name: "voiceChannelLeave",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        await endVoiceActivity(member);
        await checkGuildVoiceEmpty(client, member.guild, channel);
        
        new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
            .check(
                new Suss({ member, channel })
            );
    }
}
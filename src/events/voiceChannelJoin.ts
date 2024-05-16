import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { CoordinatedAction, Ghost, Suss } from "@/modules/achievement/achievements";
import { getLastChannelVoiceActivity, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelJoin: Event = {
    name: "voiceChannelJoin",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        const userActivity = await startVoiceActivity(client, member, channel) || undefined;
        const lastChannelActivity = await getLastChannelVoiceActivity(member.user.id, channel.id);
        
        new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
            .check([
                new Suss({ member, channel }),
                new CoordinatedAction({ lastChannelActivity, userActivity }),
                new Ghost({ member, channel }),
            ]);
    }
}
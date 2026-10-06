import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Comeback, CoordinatedAction, Ghost, Host, Regular, checkVoiceChannelMembers } from "@/modules/achievement/achievements";
import { getGuildVoiceBreakMs, getLastChannelVoiceActivity, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelJoin: Event = {
    name: "voiceChannelJoin",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        const userActivity = await startVoiceActivity(client, member, channel) || undefined;
        const lastChannelActivity = await getLastChannelVoiceActivity(member.user.id, channel.id);
        // Comeback counts the break in this guild, and only on a real join (undeafen and leaving AFK also open a session)
        const breakMs = userActivity ? await getGuildVoiceBreakMs(member.id, member.guild.id) : null;
        
        new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
            .check([
                new CoordinatedAction({ lastChannelActivity, userActivity }),
                new Ghost({ member, channel }),
                new Regular({ member }),
                ...(userActivity ? [new Host({ activity: userActivity })] : []),
                ...(breakMs ? [new Comeback({ breakMs })] : []),
            ]);

        checkVoiceChannelMembers(client, member, channel);
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Comeback, Ghost, Regular, checkVoiceChannelMembers, checkVoiceSessionStart } from "@/modules/achievement/achievements";
import { getGuildVoiceBreakMs, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelJoin: Event = {
    name: "voiceChannelJoin",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        // Taken before any await: Coordinated Action compares join times in fractions of a second
        const joinedAt = new Date();
        const userActivity = await startVoiceActivity(client, member, channel, joinedAt);
        // Comeback counts the break in this guild, and only on a real join (undeafen and leaving AFK also open a session)
        const breakMs = userActivity ? await getGuildVoiceBreakMs(member.id, member.guild.id) : null;

        new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
            .check([
                new Ghost({ member, channel }),
                new Regular({ member }),
                ...(breakMs ? [new Comeback({ breakMs })] : []),
            ]);
        if (userActivity)
            await checkVoiceSessionStart(client, member, channel, userActivity);

        checkVoiceChannelMembers(client, member, channel);
    }
}

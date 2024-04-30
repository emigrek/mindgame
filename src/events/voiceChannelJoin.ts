import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { CoordinatedAction } from "@/modules/achievement/achievements";
import { getLastChannelVoiceActivity, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelJoin: Event = {
    name: "voiceChannelJoin",
    run: async (client: ExtendedClient, member: GuildMember, channel: VoiceChannel) => {
        const lastChannelActivity = await getLastChannelVoiceActivity(channel.id);

        startVoiceActivity(client, member, channel)
            .then(activity => {
                if (!activity || !lastChannelActivity) return;

                new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
                    .add(new CoordinatedAction({ first: lastChannelActivity, second: activity }))
                    .check();
            });
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { checkVoiceChannelMembers, checkVoiceSessionEnd } from "@/modules/achievement/achievements";
import { checkGuildVoiceEmpty, endVoiceActivity, getVoiceActivity, startVoiceActivity } from "@/modules/activity";
import { GuildMember, VoiceChannel } from "discord.js";

export const voiceChannelSwitch: Event = {
    name: "voiceChannelSwitch",
    run: async (client: ExtendedClient, member: GuildMember, oldChannel: VoiceChannel, newChannel: VoiceChannel) => {
        const { guild } = member;

        const activity = await getVoiceActivity({ userId: member.id, guildId: guild.id });

        if (!activity) {
            await startVoiceActivity(client, member, newChannel);
        } else if (newChannel.id === guild.afkChannelId) {
            checkVoiceSessionEnd(client, member, await endVoiceActivity(member));
            await checkGuildVoiceEmpty(client, guild, oldChannel);
        } else {
            activity.channelId = newChannel.id;
            await activity.save();
        }

        checkVoiceChannelMembers(client, member, oldChannel, newChannel);

        await checkGuildVoiceEmpty(client, guild, oldChannel);
    }
}
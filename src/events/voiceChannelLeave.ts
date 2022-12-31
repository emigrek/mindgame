import { Event } from "../interfaces";
import { endVoiceActivity } from "../modules/activity";
import { getGuild } from "../modules/guild";
import { sweepTextChannel } from "../modules/messages";

export const voiceChannelLeave: Event = {
    name: "voiceChannelLeave",
    run: async (client, member, channel) => {
        await endVoiceActivity(client, member);

        const sourceGuild = await getGuild(channel.guild);
        if(!sourceGuild) return;

        const defaultChannel = channel.guild.channels.cache.get(sourceGuild.channelId);
        if(!defaultChannel) return;

        await sweepTextChannel(client, channel.guild, defaultChannel);
        await sweepTextChannel(client, channel.guild, channel);
    }
}
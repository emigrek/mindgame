import { GuildMember, TextChannel } from "discord.js";
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
        if(!sourceGuild.autoSweeping) return;

        const guild = await channel.guild.fetch();
        const guildDefaultChannel = guild.channels.cache.get(sourceGuild.channelId);

        await sweepTextChannel(client, channel.guild, channel);
        if(guildDefaultChannel) {
            await sweepTextChannel(client, channel.guild, guildDefaultChannel as TextChannel);
        }
    }
}
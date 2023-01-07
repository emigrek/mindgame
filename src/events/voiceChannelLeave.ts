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

        const guild = channel.guild;
        const guildDefaultChannel = guild.channels.cache.get(sourceGuild.channelId);
        const guildVoiceActiveUsers = guild.members.cache.filter((m: GuildMember) => m.voice.channel && !m.user.bot).size;

        await sweepTextChannel(client, channel.guild, channel);
        if(guildDefaultChannel && !guildVoiceActiveUsers) {
            await sweepTextChannel(client, channel.guild, guildDefaultChannel as TextChannel);
        }
    }
}
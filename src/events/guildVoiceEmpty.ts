import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import { sweepTextChannel } from "@/modules/messages";
import { Guild, VoiceChannel } from "discord.js";
import { delay } from '@/utils/delay';

export const guildVoiceEmpty: Event = {
    name: "guildVoiceEmpty",
    run: async (client: ExtendedClient, guild: Guild, lastChannel: VoiceChannel) => {
        const sourceGuild = await getGuild(guild);
        if (!sourceGuild || !sourceGuild.autoSweeping) return;

        await delay(10 * 1000);
        
        await sweepTextChannel(client, lastChannel);

        if(!sourceGuild.channelId) return;
        const guildDefaultChannel = guild.channels.cache.get(sourceGuild.channelId) as VoiceChannel;
        if (!guildDefaultChannel) return;

        await sweepTextChannel(client, guildDefaultChannel);
    }
}
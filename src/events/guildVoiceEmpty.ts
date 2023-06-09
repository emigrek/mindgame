import { Event } from "../interfaces";
import { getGuild } from "../modules/guild";
import { sweepTextChannel } from "../modules/messages";

export const guildVoiceEmpty: Event = {
    name: "guildVoiceEmpty",
    run: async (client, guild, lastChannel) => {
        const sourceGuild = await getGuild(guild);
        if(!sourceGuild) return;

        if(sourceGuild.autoSweeping) {
            await sweepTextChannel(client, lastChannel);
            const guildDefaultChannel = guild.channels.cache.get(sourceGuild.channelId);
            if(!guildDefaultChannel) return;
            await sweepTextChannel(client, guildDefaultChannel);
        }
    }
}
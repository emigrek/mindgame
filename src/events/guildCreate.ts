import { BaseChannel, ChannelType, TextChannel } from "discord.js";
import { Event } from "../interfaces";
import { createGuild } from "../modules/guild/";
import { createUsers } from "../modules/user/";
import { updatePresence } from "../modules/presence/";
import { setDefaultChannelId } from "../modules/guild";

export const guildCreate: Event = {
    name: "guildCreate",
    run: async (client, guild) => {
        await createGuild(guild);
        await createUsers(guild);
        await updatePresence(client);

        const owner = await client.users.fetch(guild.ownerId);
        const textChannels = guild.channels.cache.filter((channel: BaseChannel) => channel.type === ChannelType.GuildText);

        if(!textChannels.size) {
            await owner?.send({ content: client.i18n.__("config.noValidChannels") });
            return;
        }

        const proposedTextChannel = textChannels.first() as TextChannel;
        await setDefaultChannelId(guild, proposedTextChannel.id);
    }
}
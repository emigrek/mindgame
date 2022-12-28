import { BaseChannel, ChannelType, TextChannel } from "discord.js";
import { Event } from "../interfaces";
import { createGuild } from "../modules/guild/";
import { updatePresence } from "../modules/presence/";
import { assignLevelRolesInGuild } from "../modules/roles/";
import { setDefaultChannelId } from "../modules/guild";

export const guildCreate: Event = {
    name: "guildCreate",
    run: async (client, guild) => {
        await createGuild(guild);

        // decided no to create users on guild join due to heavy load in case of a bot being added to a large server
        // await createUsers(guild);

        await updatePresence(client);
        await assignLevelRolesInGuild(client, guild);

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
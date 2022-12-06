import { ActionRowBuilder, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";

const sendMissingDefaultChannelMessage = async (client: ExtendedClient, guild: Guild) => {
    withGuildLocale(client, guild);

    const owner = await client.users.fetch(guild.ownerId);
    const textChannels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText);

    if(!textChannels.size) {
        await owner?.send({ content: client.i18n.__("config.noValidChannels") });
        return;
    }

    const options = textChannels.map((channel) => {
        return {
            label: channel.name,
            description: client.i18n.__mf("config.channelWatchers", { count: (channel instanceof ThreadChannel ? 0 : channel.members.size) }),
            value: channel.id
        }
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("defaultChannelSelect")
                .setPlaceholder(client.i18n.__("config.selectDefaultChannel"))
                .addOptions(options)
        );
    
    const proposedTextChannel = textChannels.first() as TextChannel;
    const communication = proposedTextChannel ?? owner;

    await communication.send({
        components: [row]
    });
}


export { sendMissingDefaultChannelMessage };
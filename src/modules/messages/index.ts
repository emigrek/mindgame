import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";

const sendConfigMessage = async (client: ExtendedClient, guild: Guild) => {
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
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(options)
        );

    const locales = client.i18n.getLocales();
    const currentLocale = client.i18n.getLocale(); 
    const localesButtons: ButtonBuilder[] = [];
    const languageNames = new Intl.DisplayNames([currentLocale], {
        type: 'language'
    });

    locales.forEach((locale) => {
        const flagCode = locale.toLowerCase().slice(0,2);
        const label = `${languageNames.of(flagCode)}`;
        const button = new ButtonBuilder()
            .setCustomId(flagCode)
            .setLabel(label)
            .setStyle(currentLocale === locale ? ButtonStyle.Success : ButtonStyle.Secondary);

        localesButtons.push(button);
    });

    const row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            [...localesButtons, new ButtonBuilder()
                .setCustomId("remove")
                .setLabel("❌")
                .setStyle(ButtonStyle.Danger)
            ]
        );
    
    const proposedTextChannel = textChannels.first() as TextChannel;
    const communication = proposedTextChannel ?? owner;

    await communication.send({
        components: [row, row2]
    });
}


export { sendConfigMessage };
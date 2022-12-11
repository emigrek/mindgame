import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel, SelectMenuOptionBuilder, SelectMenuComponentOptionData, MessagePayload } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";
import nodeHtmlToImage from "node-html-to-image";
import { configHeader, configLogo, headerTemplate } from "./templates";
import { getGuild, getGuilds } from "../guild";
import { Guild as GuildInterface } from "../../interfaces";

const useHtmlFile = async (client: ExtendedClient, html: string) => {
    const image = await nodeHtmlToImage({
        html: html,
        quality: 100,
        type: "png",
        transparent: true,
        puppeteerArgs: {
            args: ['--no-sandbox'],
        },
        encoding: "base64"
    });

    const buffer = Buffer.from(image as string, "base64");
    const attachment = new AttachmentBuilder(buffer)
        .setName("image.png");

    return attachment;
}

const getConfigMessagePayload = async (client: ExtendedClient, guild: Guild) => {
    withGuildLocale(client, guild);

    const owner = await client.users.fetch(guild.ownerId);
    const textChannels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText);
    const sourceGuild = await getGuild(guild) as GuildInterface;
    const currentDefault = textChannels.find((channel) => channel.id == sourceGuild!.channelId);

    if(!textChannels.size) {
        await owner?.send({ content: client.i18n.__("config.noValidChannels") });
        return;
    }

    const defaultChanneloptions = textChannels.map((channel) => {
        return {
            label: `#${channel.name}`,
            description: client.i18n.__mf("config.channelWatchers", { count: (channel instanceof ThreadChannel ? 0 : channel.members.filter(member => !member.user.bot).size) }),
            value: channel.id
        }
    });

    const exitButton = new ButtonBuilder()
        .setCustomId("remove")
        .setLabel(client.i18n.__("config.close"))
        .setStyle(ButtonStyle.Danger);

    const notificationsButton = new ButtonBuilder()
        .setCustomId("notifications")
        .setLabel(client.i18n.__("config.notificationsButtonLabel"))
        .setStyle(sourceGuild!.notifications ? ButtonStyle.Success : ButtonStyle.Secondary);
    
    const channelSelect = new StringSelectMenuBuilder()
        .setCustomId("defaultChannelSelect")
        .setPlaceholder(currentDefault ? client.i18n.__mf("config.selectChannelPlaceholder", { channel: currentDefault!.name }) : client.i18n.__("config.selectChannelPlaceholderNoDefault"))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(defaultChanneloptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(
            channelSelect
        );

    const locales = client.i18n.getLocales();
    const currentLocale = client.i18n.getLocale(); 
    const languageNames = new Intl.DisplayNames([currentLocale], {
        type: 'language'
    });

    const flagCode = currentLocale.toLowerCase().slice(0,2);
    const label = `${languageNames.of(flagCode)}`;
    const languageOptions: any = [];

    locales.forEach((locale) => {
        const flagCode = locale.toLowerCase().slice(0,2);
        const label = `${languageNames.of(flagCode)}`;
        languageOptions.push({
            label: label,
            description: locale,
            value: locale
        });
    });

    const languageSelect = new StringSelectMenuBuilder()
        .setCustomId("localeSelect")
        .setPlaceholder(client.i18n.__mf("config.selectLocalePlaceholder", { locale: label }))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(languageOptions);

    const row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(languageSelect);

    const row3 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(notificationsButton, exitButton);
    
    const header = await getConfigAttachment(client, guild);

    return {
        components: [row, row2, row3],
        files: [header]
    };
}

const getConfigAttachment = async (client: ExtendedClient, guild: Guild) => {
    const file = useHtmlFile(client, 
        headerTemplate(`
            <div class="w-full h-full flex flex-col align-start justify-start items-start bg-transparent">
                ${configHeader(client, guild)}
                <div class="w-full h-full flex items-center bg-[#202225] rounded-2xl">
                    ${configLogo(client)}
                </div>
            </div>
        `)
    );

    return file;
}

export { getConfigMessagePayload, getConfigAttachment };
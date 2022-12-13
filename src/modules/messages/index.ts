import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel, SelectMenuOptionBuilder, SelectMenuComponentOptionData, MessagePayload, StringSelectMenuOptionBuilder } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";
import nodeHtmlToImage from "node-html-to-image";
import { getGuild } from "../guild";
import { Guild as GuildInterface, SelectMenuOption, User } from "../../interfaces";
import { getExitButton, getNotificationsButton } from "./buttons";
import { getChannelSelect, getLanguageSelect } from "./selects";
import { getConfigEmbed, useEmbedSpacer } from "../embeds";
import { embedSpacer } from "../messages/templates";

const useHtmlFile = async (html: string) => {
    const image = await nodeHtmlToImage({
        html: html,
        quality: 80,
        type: "jpeg",
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

    const defaultChannelOptions = textChannels.map((channel) => {
        return {
            label: `#${channel.name}`,
            description: client.i18n.__mf("config.channelWatchers", { count: (channel instanceof ThreadChannel ? 0 : channel.members.filter(member => !member.user.bot).size) }),
            value: channel.id
        }
    });
    
    const notificationsButton = await getNotificationsButton(client, sourceGuild);
    const channelSelect = await getChannelSelect(client, currentDefault as TextChannel, defaultChannelOptions as SelectMenuOption[]);

    const locales = client.i18n.getLocales();
    const currentLocale = client.i18n.getLocale(); 
    const languageNames = new Intl.DisplayNames([currentLocale], {
        type: 'language'
    });

    const flagCode = currentLocale.toLowerCase().slice(0,2);
    const languageOptions: SelectMenuOption[] = [];

    locales.forEach((locale) => {
        const flagCode = locale.toLowerCase().slice(0,2);
        const label = `${languageNames.of(flagCode)}`;
        languageOptions.push({
            label: label,
            description: locale,
            value: locale
        });
    });

    const languageSelect = await getLanguageSelect(client, currentLocale, languageOptions);
    
        
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(channelSelect);
    const row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(languageSelect);
    const row3 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(notificationsButton);

    const embed = await getConfigEmbed(client, guild);
    const spacer = await useEmbedSpacer();

    return {
        components: [row, row2, row3],
        embeds: [embed],
        files: [spacer],
        ephemeral: true
    };
}

export { getConfigMessagePayload, useHtmlFile };
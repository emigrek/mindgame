import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel, SelectMenuOptionBuilder, SelectMenuComponentOptionData, MessagePayload, StringSelectMenuOptionBuilder } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";
import nodeHtmlToImage from "node-html-to-image";
import { configHeader, configLogo, headerTemplate } from "./templates";
import { getGuild } from "../guild";
import { Guild as GuildInterface, SelectMenuOption } from "../../interfaces";
import { getExitButton, getNotificationsButton } from "./buttons";
import { getChannelSelect, getLanguageSelect } from "./selects";

const useHtmlFile = async (html: string) => {
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

    const defaultChannelOptions = textChannels.map((channel) => {
        return {
            label: `#${channel.name}`,
            description: client.i18n.__mf("config.channelWatchers", { count: (channel instanceof ThreadChannel ? 0 : channel.members.filter(member => !member.user.bot).size) }),
            value: channel.id
        }
    });

    const exitButton = await getExitButton(client);
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
        .setComponents(notificationsButton, exitButton);
    const header = await getConfigAttachment(client, guild);

    return {
        components: [row, row2, row3],
        files: [header]
    };
}

const getConfigAttachment = async (client: ExtendedClient, guild: Guild) => {
    const file = useHtmlFile( 
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
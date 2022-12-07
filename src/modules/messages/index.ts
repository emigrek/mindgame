import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";
import nodeHtmlToImage from "node-html-to-image";
import { headerTemplate } from "./templates";

const getConfigMessagePayload = async (client: ExtendedClient, guild: Guild) => {
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

    const exitButton = new ButtonBuilder()
        .setCustomId("remove")
        .setLabel("❌")
        .setStyle(ButtonStyle.Danger);
    
    const channelSelect = new StringSelectMenuBuilder()
        .setCustomId("defaultChannelSelect")
        .setPlaceholder(client.i18n.__("config.selectDefaultChannel"))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            channelSelect
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
        .addComponents([...localesButtons, exitButton]);
    
    const header = await getConfigAttachment(client);

    return {
        components: [row, row2],
        files: [header]
    };
}

const getConfigAttachment = async (client: ExtendedClient) => {
    const template = headerTemplate(`
        <div class="flex flex-col space-y-2 justify-center items-center">
            <div class="flex items-center justify-center text-5xl font-bold text-white space-x-3">
                <div>Config</div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12">
                    <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                </svg>
            </div>
            <div class="flex items-center justify-center text-white/80">
                ${client.i18n.__("config.headerSubtitle")}
            </div>
        </div>
    `);

    const image = await nodeHtmlToImage({
        html: template,
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


export { getConfigMessagePayload, getConfigAttachment };
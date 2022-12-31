import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel, SelectMenuOptionBuilder, SelectMenuComponentOptionData, MessagePayload, StringSelectMenuOptionBuilder, BaseInteraction, InteractionType, ButtonInteraction, InteractionResponse, CommandInteraction, ContextMenuCommandInteraction, UserContextMenuCommandInteraction, User, Message, Collection } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";
import nodeHtmlToImage from "node-html-to-image";
import { getGuild } from "../guild";
import { Guild as GuildInterface, SelectMenuOption, User as DatabaseUser } from "../../interfaces";
import { getLevelRolesButton, getLevelRolesHoistButton, getNotificationsButton, getProfileTimePublicButton, getQuickButtons } from "./buttons";
import { getChannelSelect, getLanguageSelect } from "./selects";

import Vibrant = require('node-vibrant');
import chroma = require('chroma-js');
import { guildConfig, guildStatistics, layoutLarge, layoutMedium, layoutXLarge, userProfile } from "./templates";
import { getUser } from "../user";

interface ImageHexColors {
    Vibrant: string;
    DarkVibrant: string;
}

const useImageHex = async (image: string) => {
    if(!image) return { Vibrant: "#373b48", DarkVibrant: "#373b48" };
    const colors = await Vibrant.from(image).getPalette();
    return {
        Vibrant: chroma(colors.Vibrant!.hex!).hex(), 
        DarkVibrant: chroma(colors.DarkVibrant!.hex!).hex()
    };
}

const getColorInt = (color: string) => {
    return parseInt(color.slice(1), 16);
}

const useHtmlFile = async (html: string) => {
    const image = await nodeHtmlToImage({
        html: html,
        quality: 100,
        type: "png",
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
    const levelRolesButton = await getLevelRolesButton(client, sourceGuild);
    const levelRolesHoistButton = await getLevelRolesHoistButton(client, sourceGuild);
    const channelSelect = await getChannelSelect(client, currentDefault as TextChannel, defaultChannelOptions as SelectMenuOption[]);

    const locales = client.i18n.getLocales();
    const currentLocale = client.i18n.getLocale(); 
    const languageNames = new Intl.DisplayNames([currentLocale], {
        type: 'language'
    });
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
        .setComponents(levelRolesButton, levelRolesHoistButton);
    const row4 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(notificationsButton);

    const guildIcon = guild.iconURL({ extension: "png" });
    var colors: ImageHexColors = await useImageHex(guildIcon!);
    const guildConfigHtml = await guildConfig(client, sourceGuild, colors);
    const file = await useHtmlFile(layoutMedium(guildConfigHtml, colors));

    return {
        components: [row, row2, row3, row4],
        files: [file],
        ephemeral: true
    };
}

const getUserMessagePayload = async (client: ExtendedClient, interaction: ButtonInteraction | UserContextMenuCommandInteraction, targetUser?: DatabaseUser) => {
    withGuildLocale(client, interaction.guild!);

    const sourceUser = await getUser(interaction.user) as DatabaseUser;
    if(!sourceUser) {
        return { content: client.i18n.__("profile.notFound"), ephemeral: true };
    }

    if(interaction instanceof UserContextMenuCommandInteraction) {
        targetUser = await getUser(interaction.targetUser) as DatabaseUser;
    }

    let sourceTargetUser = targetUser ? targetUser : sourceUser;

    const selfCall = sourceUser.userId == sourceTargetUser.userId;
    const colors = await useImageHex(sourceTargetUser.avatarUrl);
    const userProfileHtml = await userProfile(client, sourceTargetUser, colors, selfCall);

    const file = await useHtmlFile(layoutLarge(userProfileHtml, colors));
    const profileTimePublic = await getProfileTimePublicButton(client, sourceTargetUser);
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(profileTimePublic!);
        
    return { files: [file], ephemeral: true, components: selfCall ? [row] : [] };
}

const getStatisticsMessagePayload = async (client: ExtendedClient, guild: Guild) => {
    withGuildLocale(client, guild);
    const sourceGuild = await getGuild(guild) as GuildInterface;
    const guildIcon = guild.iconURL({ extension: "png" });
    var colors: ImageHexColors = await useImageHex(guildIcon!);
    const guildStatisticsHtml = await guildStatistics(client, sourceGuild, colors);
    const file = await useHtmlFile(layoutXLarge(guildStatisticsHtml, colors));

    return {
        files: [file]
    };
};

const getLevelUpMessagePayload = async (client: ExtendedClient, user: User, guild: Guild) => {
    withGuildLocale(client, guild);

    const sourceUser = await getUser(user) as DatabaseUser;
    var colors: ImageHexColors = await useImageHex(sourceUser.avatarUrl!);

    const embed = {
        color: getColorInt(colors.Vibrant!),
        title: client.i18n.__("notifications.levelUpTitle"),
        description: client.i18n.__mf("notifications.levelUpDescription", { user: user.id, level: sourceUser.stats.level }),
        fields: [
            {
                name: client.i18n.__("notifications.levelField"),
                value: `\`\`\`${sourceUser.stats.level}\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("notifications.winsField"),
                value: `\`\`\`${sourceUser.stats.games.won.skill + sourceUser.stats.games.won.skin}\`\`\``,
                inline: true
            }
        ],
        thumbnail: {
            url: 'https://i.imgur.com/cSTkdFG.png',
        }
    };

    return {
        embeds: [embed]
    };
};

const sendToDefaultChannel = async (client: ExtendedClient, guild: Guild, message: MessagePayload | string) => {
    const sourceGuild = await getGuild(guild) as GuildInterface;
    if(!sourceGuild.channelId) return null;
    
    const defaultChannel = await client.channels.fetch(sourceGuild.channelId) as TextChannel;
    if(!defaultChannel) return null;

    await defaultChannel.send(message);
};

const sweepTextChannel = async (client: ExtendedClient, guild: Guild, channel: TextChannel) => {
    return new Promise(async (resolve, reject) => {
        const sourceGuild = await getGuild(guild) as GuildInterface;
        if(!sourceGuild.channelId) return null;
        
        const defaultChannel = await client.channels.fetch(sourceGuild.channelId) as TextChannel;
        if(!defaultChannel) return null;

        const popularPrefixes = ['!', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', ';', ':', '"', "'", ',', '.', '/', '?', '<', '>', '|', '\\', '~', '`'];

        if(channel.id == defaultChannel.id) {
            const messages = await channel.messages.fetch({ limit: 100 });
            const validToDelete = (message: Message) => message.author.bot && popularPrefixes.filter(p => message.content.startsWith(p));
            const messagesToDelete = messages.filter(validToDelete);
            
            const deleted = await channel.bulkDelete(messagesToDelete);
            resolve(deleted.size);
        } else {
            resolve(0);
        }
    });
};

const attachQuickButtons = async (client: ExtendedClient, channel: TextChannel) => {
    withGuildLocale(client, channel.guild!);

    const lastMessages = await channel.messages.fetch({ limit: 50 });
    const clientLastMessages = lastMessages.filter(m => m.author.id == client.user!.id);
    const lastMessage = clientLastMessages.first();
    if(!lastMessage) return;

    const buttons: Collection<string, ButtonBuilder> = await getQuickButtons(client, channel.guild);
    const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(buttons.get("sweep")!, buttons.get("profile")!, buttons.get("statistics")!);

    for await (const message of lastMessages.values()) {
        if(message.components.length > 0) {
            await message.edit({ components: [] });
        }
    }

    await lastMessage.edit({ components: [row] });
};

export { getConfigMessagePayload, attachQuickButtons, sweepTextChannel, getLevelUpMessagePayload, getStatisticsMessagePayload, getUserMessagePayload, useHtmlFile, useImageHex, ImageHexColors, getColorInt, sendToDefaultChannel };
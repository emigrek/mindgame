import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel, MessagePayload, ButtonInteraction, CommandInteraction, UserContextMenuCommandInteraction, User, Message, Collection, ImageURLOptions, EmbedField, GuildMember, Embed, StringSelectMenuInteraction, GuildAuditLogs } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { withGuildLocale } from "../locale";
import nodeHtmlToImage from "node-html-to-image";
import { getGuild } from "../guild";
import { Guild as GuildInterface, Select, SelectMenuOption, Sorting, User as DatabaseUser } from "../../interfaces";
import { getAutoSweepingButton, getLevelRolesButton, getLevelRolesHoistButton, getNotificationsButton, getProfileTimePublicButton, getQuickButtonsRows, getRankingGuildOnlyButton, getRankingPageDownButton, getRankingPageUpButton, getRoleColorSwitchButton, getRoleColorUpdateButton, getStatisticsNotificationButton } from "./buttons";
import { getChannelSelect, getLanguageSelect, getRankingSortSelect } from "./selects";
import { getLastCommits } from "../../utils/commits";
import { getSortingByType, runMask, sortings } from "../user/sortings";

import moment from "moment";
import Vibrant = require('node-vibrant');
import chroma = require('chroma-js');
import { guildConfig, guildStatistics, layoutLarge, layoutMedium, layoutXLarge, userProfile } from "./templates";
import { getRanking, getRankingPagesCount, getUser } from "../user";
import { getMemberColorRole } from "../roles";
import messageSchema from "../schemas/Message";
import mongoose, { ObjectId } from "mongoose";

interface ImageHexColors {
    Vibrant: string;
    DarkVibrant: string;
}

const messageModel = mongoose.model("Message", messageSchema);

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
    await withGuildLocale(client, guild);

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
    const statisticsNotificationButton = await getStatisticsNotificationButton(client, sourceGuild);
    const levelRolesButton = await getLevelRolesButton(client, sourceGuild);
    const levelRolesHoistButton = await getLevelRolesHoistButton(client, sourceGuild);
    const autoSweepingButton = await getAutoSweepingButton(client, sourceGuild);
    const channelSelect = await getChannelSelect(client, currentDefault as TextChannel, defaultChannelOptions as SelectMenuOption[]);

    const locales = client.i18n.getLocales();
    const currentLocale = client.i18n.getLocale(); 
    const languageNames = new Intl.DisplayNames([currentLocale], {
        type: 'language'
    });
    const languageOptions: SelectMenuOption[] = locales.map((locale) => {
        return {
            label: `${languageNames.of(locale)}`,
            description: locale,
            value: locale
        }
    });

    const languageSelect = await getLanguageSelect(client, currentLocale, languageOptions);
    
        
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(channelSelect);
    const row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(languageSelect);
    const row3 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(levelRolesButton, levelRolesHoistButton);
    const row4 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(notificationsButton, autoSweepingButton, statisticsNotificationButton);

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

const getUserMessagePayload = async (client: ExtendedClient, interaction: ButtonInteraction | UserContextMenuCommandInteraction, targetUserId: string) => {
    const sourceUser = await getUser(interaction.user) as DatabaseUser;

    const targetUser = client.users.cache.get(targetUserId)!;
    const sourceTargetUser = await getUser(targetUser) as DatabaseUser;

    if(!sourceUser) {
        return { content: client.i18n.__("profile.notFound"), ephemeral: true };
    }
    
    const selfCall = sourceUser.userId === targetUser.id;
    const renderedUser = sourceTargetUser ? sourceTargetUser : sourceUser;

    const colors = await useImageHex(renderedUser.avatarUrl);
    const userProfileHtml = await userProfile(client, renderedUser, colors, selfCall);

    const file = await useHtmlFile(layoutLarge(userProfileHtml, colors));
    const profileTimePublic = await getProfileTimePublicButton(client, renderedUser);
    const row = new ActionRowBuilder<ButtonBuilder>();

    if(selfCall)
        row.addComponents(profileTimePublic);

    return { files: [file], ephemeral: true, components: [row] };
}

const getStatisticsMessagePayload = async (client: ExtendedClient, guild: Guild) => {
    await withGuildLocale(client, guild);
    const sourceGuild = await getGuild(guild) as GuildInterface;
    const guildIcon = guild.iconURL({ dynamic: false, extension: "png", forceStatic: true } as ImageURLOptions);
    var colors: ImageHexColors = await useImageHex(guildIcon!);
    const guildStatisticsHtml = await guildStatistics(client, sourceGuild, colors);
    const file = await useHtmlFile(layoutXLarge(guildStatisticsHtml, colors));

    return {
        files: [file]
    };
};

const getLevelUpMessagePayload = async (client: ExtendedClient, user: User, guild: Guild) => {
    await withGuildLocale(client, guild);

    const sourceUser = await getUser(user) as DatabaseUser;
    var colors: ImageHexColors = await useImageHex(sourceUser.avatarUrl!);

    const embed = {
        color: getColorInt(colors.Vibrant!),
        title: client.i18n.__("notifications.levelUpTitle"),
        description: client.i18n.__mf("notifications.levelUpDescription", { tag: sourceUser.tag, level: sourceUser.stats.level }),
        fields: [
            {
                name: client.i18n.__("notifications.levelField"),
                value: `\`\`\`${sourceUser.stats.level}\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("notifications.todayVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.day.time.voice/3600))}H\`\`\``,
                inline: true
            },
            { 
                name: client.i18n.__("notifications.weekVoiceTimeField"),
                value: `\`\`\`${Math.round((sourceUser.week.time.voice/3600))}H\`\`\``,
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

const getCommitsMessagePayload = async (client: ExtendedClient) => {
    const packageJsonRepoUrl = (await import("../../../package.json")).repository.url;
    const repo = packageJsonRepoUrl.split("/").slice(-2).join("/");
    const commits = await getLastCommits(repo, 10);
    const fields: EmbedField[] = commits.map((commit: any) => ({
        name: `${commit.author.login}`,
        value: `\`\`\`${commit.commit.message}\`\`\`[commit](${commit.html_url}) - ${moment(commit.commit.author.date).format("DD/MM/YYYY HH:mm")}`,
        inline: true
    }));

    return {
        embeds: [{
            color: 0x0099ff,
            title: client.i18n.__mf("commits.title", { count: commits.length }),
            fields: fields
        }]
    };
};

const getColorMessagePayload = async (client: ExtendedClient, interaction: CommandInteraction | ButtonInteraction) => {
    let sourceUser = await getUser(interaction.user) as DatabaseUser;
    let user = await client.users.fetch(sourceUser.userId, {
        force: true
    });
    var color = getColorInt(user.hexAccentColor!);
    let roleColor = getMemberColorRole(interaction.member as GuildMember);

    if(!color) {
        let embed = {
            color: 0x000000,
            title: client.i18n.__("color.title"),
            description: client.i18n.__("color.noColor"),
            thumbnail: {
                url: sourceUser.avatarUrl
            }
        }

        return {
            embeds: [embed]
        }
    }

    if(sourceUser.stats.level < 160 && !roleColor) {
        let embed = {
            color: color,
            title: client.i18n.__("color.title"),
            description: client.i18n.__mf("levelRequirement", { level: 160 }),
            thumbnail: {
                url: sourceUser.avatarUrl
            }
        };

        return { 
            embeds: [embed]
        };
    }

    let roleColorSwitchButton = await getRoleColorSwitchButton(client, roleColor ? true : false);
    let roleColorUpdateButton = await getRoleColorUpdateButton(client);
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(roleColorSwitchButton);

    if(roleColor) {
        row.addComponents(roleColorUpdateButton);
    }

    let embed = {
        color: color,
        title: client.i18n.__("color.title"),
        description: client.i18n.__("color.description"),
        thumbnail: {
            url: sourceUser.avatarUrl
        }
    };

    return {
        embeds: [embed],
        components: [row]
    };
};

const getRankingMessagePayload = async (client: ExtendedClient, interaction: CommandInteraction | ButtonInteraction | StringSelectMenuInteraction, sorting: Sorting, page: number, guild?: Guild) => {
    if(interaction.guild) {
        await withGuildLocale(client, interaction.guild);
    }
    const users = await getRanking(client, sorting, page, guild) as (DatabaseUser & mongoose.Document)[];
    const isInteractionCaller = (user: DatabaseUser & mongoose.Document): boolean => {
        return user.userId === interaction.user!.id;
    };
    const fields: EmbedField[] = users.map((user: (DatabaseUser & mongoose.Document), index) => ({
        name: `${index + 1 + ((page - 1) * 10)}. ${user.tag} ${isInteractionCaller(user) ? client.i18n.__("ranking.you") : ""}`,
        value: `\`\`\`${runMask(client, sorting.mask, user)}\`\`\``,
        inline: true
    }));
    const colors = await useImageHex(interaction.user.avatarURL({ extension: "png", size: 256 })!);
    const color = getColorInt(colors.Vibrant!);
    const pagesCount = await getRankingPagesCount(client, sorting, guild);
    const embed = {
        title: client.i18n.__mf("ranking.title", { type: sorting.type.toUpperCase(), scope: guild ? 'GUILD' : 'GLOBAL' }),
        fields: fields,
        color: color,
        footer: {
            text: client.i18n.__mf("ranking.footer", { page: page, pages: pagesCount })
        }
    }
    const selectOptions = sortings.map((sorting) => ({
        label: sorting.label,
        description: sorting.range.toUpperCase(),
        value: sorting.type
    }));
    const rankingSortSelect = await getRankingSortSelect(client, sorting, selectOptions);
    const guildOnly = await getRankingGuildOnlyButton(client, guild ? true : false);
    const up = await getRankingPageUpButton(client, page > 1 ? false : true);
    const down = await getRankingPageDownButton(client, page < pagesCount ? false : true);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(rankingSortSelect);
    const row2 = new ActionRowBuilder<ButtonBuilder>();
    row2.addComponents(up, down);
    if(interaction.guild) {
        row2.addComponents(guildOnly);
    }
    return {
        embeds: [embed],
        components: [row, row2]
    };
};

const getDailyRewardMessagePayload = async (client: ExtendedClient, user: User, guild: Guild, next: number) => {
    await withGuildLocale(client, guild);

    const sourceUser = await getUser(user) as DatabaseUser;
    var colors: ImageHexColors = await useImageHex(sourceUser.avatarUrl!);
    let reward = parseInt(process.env.DAILY_REWARD!);

    const embed = {
        color: getColorInt(colors.Vibrant!),
        title: client.i18n.__("notifications.dailyRewardTitle"),
        description: client.i18n.__mf("notifications.dailyRewardDescription", { tag: sourceUser.tag, time: next }),
        fields: [
            { 
                name: client.i18n.__("notifications.dailyRewardField"),
                value: `\`\`\`${client.numberFormat.format(reward)} EXP\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("notifications.todayVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.day.time.voice/3600))}H\`\`\``,
                inline: true
            },
            { 
                name: client.i18n.__("notifications.weekVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.week.time.voice/3600))}H\`\`\``,
                inline: true
            },
        ],
        thumbnail: {
            url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/60/microsoft/74/shortcake_1f370.png',
        }
    };

    return {
        embeds: [embed]
    };
};

const sendToDefaultChannel = async (client: ExtendedClient, guild: Guild, message: MessagePayload | string, temporary: boolean = true) => {
    const sourceGuild = await getGuild(guild) as GuildInterface;
    if(!sourceGuild.channelId) return null;
    
    const defaultChannel = await client.channels.fetch(sourceGuild.channelId) as TextChannel;
    if(!defaultChannel) return null;

    const messageSent = await defaultChannel.send(message);

    if(temporary) {
        setTimeout(async () => {
            await messageSent.delete();
        }, 5000);
    }
};

const sweepTextChannel = async (client: ExtendedClient, channel: TextChannel) => {
    return new Promise(async (resolve, reject) => {
        const popularPrefixes = ['!', '#', '$', '%', '^', '&', '*', '(', ')'];
        let messages = new Collection<string, Message>();

        try {
            messages = await channel.messages.fetch({ limit: 50 });
        } catch (e) {
            let missingPermissions = await channel.send(client.i18n.__("utils.missingPermissions"));
            setTimeout(async () => {
                await missingPermissions.delete();
            }, 5000);
        }
        
        const messagesToDelete = messages.filter((message: Message) => {
            const filter =
                popularPrefixes.some(prefix => message.content.startsWith(prefix)) || 
                (message.author.bot && message.attachments && message.attachments.size == 0) ||
                (message.author.bot && message.embeds.length)
            return filter;
        });
        let count = 0;
        const promises = messagesToDelete.map(async (message: Message) => {
            if(!message.deletable) return;
            
            await message.delete();
            count++;
        });

        await Promise.all(promises);
        await attachQuickButtons(client, channel);
        resolve(count);
    });
};

const attachQuickButtons = async (client: ExtendedClient, channel: TextChannel) => {
    if(channel.guild) {
        await withGuildLocale(client, channel.guild!);
    }

    let lastMessages = new Collection<string, Message>();

    try {
        lastMessages = await channel.messages.fetch({ limit: 50 });
    } catch (e) {
        let missingPermissions = await channel.send(client.i18n.__("utils.missingPermissions"));
        setTimeout(async () => {
            await missingPermissions.delete();
        }, 5000);
    }
    
    const clientLastMessages = lastMessages.filter(m => m.author.id == client.user!.id) as Collection<string, Message>;
    const lastMessage = clientLastMessages.first();
    if(!lastMessage) return;

    const quickButtonsRows = await getQuickButtonsRows(client, lastMessage);

    for await (const message of clientLastMessages.values()) {
        if(message.components.length > 0 && message.id != lastMessage.id) {
            try {
                await message.edit({ components: [] });
            } catch (e) {
                let missingPermissions = await channel.send(client.i18n.__("utils.missingPermissions"));
                setTimeout(async () => {
                    await missingPermissions.delete();
                }, 5000);
            }
        }
    }

    try {
        await lastMessage.edit({ components: quickButtonsRows });
    } catch (e) {
        let missingPermissions = await channel.send(client.i18n.__("utils.missingPermissions"));
        setTimeout(async () => {
            await missingPermissions.delete();
        }, 5000);
    }
};

const createMessage = async (message: Message, targetUserId: string | null, name: string | null) => {
    const exists = await getMessage(message.id);
    if(exists) return exists;

    const newMessage = new messageModel({
        messageId: message.id,
        channelId: message.channel.id,
        targetUserId: targetUserId,
        name: name
    });

    await newMessage.save();
    return newMessage;
};

const getMessage = async (messageId: string) => {
    const message = await messageModel.findOne({ messageId: messageId });
    if(!message) return null;
    return message;
};

const deleteMessage = async (messageId: string) => {
    await messageModel.deleteOne({
        messageId: messageId
    });

    return true;
};

export { createMessage, getRankingMessagePayload, getMessage, deleteMessage, getDailyRewardMessagePayload, getColorMessagePayload, getConfigMessagePayload, attachQuickButtons, getCommitsMessagePayload, sweepTextChannel, getLevelUpMessagePayload, getStatisticsMessagePayload, getUserMessagePayload, useHtmlFile, useImageHex, ImageHexColors, getColorInt, sendToDefaultChannel };
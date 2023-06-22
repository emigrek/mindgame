import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel, MessagePayload, ButtonInteraction, CommandInteraction, UserContextMenuCommandInteraction, User, Message, Collection, ImageURLOptions, EmbedField, GuildMember, StringSelectMenuInteraction, EmbedBuilder } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import nodeHtmlToImage from "node-html-to-image";
import { getGuild } from "../guild";
import { SelectMenuOption, Sorting } from "../../interfaces";
import { getAutoSweepingButton, getLevelRolesButton, getLevelRolesHoistButton, getNotificationsButton, getProfileFollowButton, getProfileTimePublicButton, getQuickButtonsRows, getRankingGuildOnlyButton, getRankingPageDownButton, getRankingPageUpButton, getRepoButton, getRoleColorSwitchButton, getRoleColorUpdateButton, getStatisticsNotificationButton } from "./buttons";
import { getChannelSelect, getRankingSortSelect } from "./selects";
import { getLastCommits } from "../../utils/commits";
import { runMask, sortings } from "../user/sortings";
import moment from "moment";
import Vibrant = require('node-vibrant');
import chroma = require('chroma-js');
import { guildConfig, guildStatistics, layoutLarge, layoutMedium, layoutXLarge, userProfile } from "./templates";
import { getRanking, getRankingPagesCount, getUser } from "../user";
import { getMemberColorRole } from "../roles";
import messageSchema from "../schemas/Message";
import mongoose from "mongoose";
import { UserDocument } from "../schemas/User";
import { VoiceActivityDocument } from "../schemas/VoiceActivity";

interface ImageHexColors {
    Vibrant: string;
    DarkVibrant: string;
}

const messageModel = mongoose.model("Message", messageSchema);

const useImageHex = async (image: string) => {
    if (!image) return { Vibrant: "#373b48", DarkVibrant: "#373b48" };
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
    const owner = await client.users.fetch(guild.ownerId);
    const textChannels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText);
    const sourceGuild = await getGuild(guild);
    if (!sourceGuild) return getErrorMessagePayload(client);
    const currentDefault = textChannels.find((channel) => channel.id == sourceGuild.channelId);

    if (!textChannels.size) {
        await owner?.send({ content: client.i18n.__("config.noValidChannels") });
        return getErrorMessagePayload(client);
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

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(channelSelect);
    const row2 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(levelRolesButton, levelRolesHoistButton);
    const row3 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(notificationsButton, autoSweepingButton, statisticsNotificationButton);

    const guildIcon = guild.iconURL({ extension: "png" });
    const colors: ImageHexColors = await useImageHex(guildIcon!);
    const guildConfigHtml = await guildConfig(client, sourceGuild, colors);
    const file = await useHtmlFile(layoutMedium(guildConfigHtml, colors));

    return {
        components: [row, row2, row3],
        files: [file],
        ephemeral: true
    };
}

const getUserMessagePayload = async (client: ExtendedClient, interaction: ButtonInteraction | UserContextMenuCommandInteraction, targetUserId: string) => {
    const sourceUser = await getUser(interaction.user);
    const targetUser = client.users.cache.get(targetUserId)!;
    const sourceTargetUser = await getUser(targetUser);

    if (!sourceUser || !sourceTargetUser) {
        return {
            embeds: [{
                description: client.i18n.__("profile.notFound")
            }],
            ephemeral: true
        };
    }

    const selfCall = sourceUser.userId === targetUser.id;
    const renderedUser = sourceTargetUser ? sourceTargetUser : sourceUser;

    const colors = await useImageHex(renderedUser.avatarUrl);
    const userProfileHtml = await userProfile(client, renderedUser, colors, selfCall);

    const file = await useHtmlFile(layoutLarge(userProfileHtml, colors))
        .then((file) => {
            return file.setName(`${renderedUser.userId}.png`);
        });

    const profileTimePublic = await getProfileTimePublicButton(client, renderedUser);
    const followButton = await getProfileFollowButton(client, sourceUser, sourceTargetUser);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(selfCall ? profileTimePublic : followButton);

    return {
        components: [row],
        files: [file],
        ephemeral: true
    };
}

const getStatisticsMessagePayload = async (client: ExtendedClient, guild: Guild) => {
    client.i18n.setLocale(guild.preferredLocale);
    
    const sourceGuild = await getGuild(guild);
    if (!sourceGuild) return getErrorMessagePayload(client);
    const guildIcon = guild.iconURL({ dynamic: false, extension: "png", forceStatic: true } as ImageURLOptions);
    const colors: ImageHexColors = await useImageHex(guildIcon!);
    const guildStatisticsHtml = await guildStatistics(client, sourceGuild, colors);
    const file = await useHtmlFile(layoutXLarge(guildStatisticsHtml, colors));

    return {
        files: [file]
    };
};

const getLevelUpMessagePayload = async (client: ExtendedClient, user: User, guild: Guild) => {
    client.i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    if (!sourceUser) return getErrorMessagePayload(client);
    const colors: ImageHexColors = await useImageHex(sourceUser.avatarUrl!);

    const embed = {
        color: getColorInt(colors.Vibrant!),
        title: client.i18n.__("notifications.levelUpTitle"),
        description: client.i18n.__mf("notifications.levelUpDescription", { userId: sourceUser.userId, level: sourceUser.stats.level }),
        fields: [
            {
                name: client.i18n.__("notifications.levelField"),
                value: `\`\`\`${sourceUser.stats.level}\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("notifications.todayVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.day.time.voice / 3600))}H\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("notifications.weekVoiceTimeField"),
                value: `\`\`\`${Math.round((sourceUser.week.time.voice / 3600))}H\`\`\``,
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
    const commits = await getLastCommits(repo, 10).catch(() => {
        return null;
    });

    if (!commits) return getErrorMessagePayload(client);

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

const getHelpMessagePayload = async (client: ExtendedClient) => {
    const embed = {
        color: 0x0099ff,
        thumbnail: {
            url: client.user!.displayAvatarURL({ extension: "png" })
        },
        title: client.i18n.__("help.title"),
        description: client.i18n.__("help.description"),
        fields: [
            {
                name: client.i18n.__("help.faqQuestion1"),
                value: client.i18n.__("help.faqAnswer1"),
                inline: true
            },
            {
                name: client.i18n.__("help.faqQuestion2"),
                value: client.i18n.__("help.faqAnswer2"),
                inline: true
            },
            {
                name: client.i18n.__("help.faqQuestion3"),
                value: client.i18n.__("help.faqAnswer3"),
            }
        ],
        image: {
            url: "https://i.imgur.com/ncCPDum.png"
        },
        footer: {
            text: client.i18n.__("help.footer")
        }
    }
    const row = new ActionRowBuilder<ButtonBuilder>()
    const repoButton = await getRepoButton(client);
    row.setComponents(repoButton);

    return {
        embeds: [embed],
        components: [row]
    }
}

const getColorMessagePayload = async (client: ExtendedClient, interaction: CommandInteraction | ButtonInteraction) => {
    const sourceUser = await getUser(interaction.user);
    if (!sourceUser) 
        return {
            content: client.i18n.__("utils.userOnly")
        }

    const user = await client.users.fetch(sourceUser.userId, {
        force: true
    });
    const color = getColorInt(user.hexAccentColor!);
    const roleColor = getMemberColorRole(interaction.member as GuildMember);

    if (!color) {
        const embed = {
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

    const roleColorSwitchButton = await getRoleColorSwitchButton(client, roleColor ? true : false);
    const roleColorUpdateButton = await getRoleColorUpdateButton(client);
    const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(roleColorSwitchButton);

    if (roleColor) {
        row.addComponents(roleColorUpdateButton);
    }

    const embed = {
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
    const users = await getRanking(client, sorting, page, guild);
    const isInteractionCaller = (user: UserDocument): boolean => {
        return user.userId === interaction.user!.id;
    };
    const fields: EmbedField[] = users.map((user: UserDocument, index) => ({
        name: `${index + 1 + ((page - 1) * 10)}. ${user.tag.split('#').shift()} ${isInteractionCaller(user) ? client.i18n.__("ranking.you") : ""}`,
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
    if (interaction.guild) {
        row2.addComponents(guildOnly);
    }
    return {
        embeds: [embed],
        components: [row, row2]
    };
};

const getDailyRewardMessagePayload = async (client: ExtendedClient, user: User, guild: Guild, next: number) => {
    client.i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    if (!sourceUser) return getErrorMessagePayload(client);

    const colors: ImageHexColors = await useImageHex(sourceUser.avatarUrl!);
    const reward = parseInt(process.env.DAILY_REWARD!);

    const embed = {
        color: getColorInt(colors.Vibrant!),
        title: client.i18n.__("notifications.dailyRewardTitle"),
        description: client.i18n.__mf("notifications.dailyRewardDescription", { userId: sourceUser.userId, time: next }),
        fields: [
            {
                name: client.i18n.__("notifications.dailyRewardField"),
                value: `\`\`\`${client.numberFormat.format(reward)} EXP\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("notifications.todayVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.day.time.voice / 3600))}H\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("notifications.weekVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.week.time.voice / 3600))}H\`\`\``,
                inline: true
            },
        ],
        thumbnail: {
            url: 'https://em-content.zobj.net/thumbs/60/microsoft/74/birthday-cake_1f382.png',
        }
    };

    return {
        embeds: [embed]
    };
};

const getErrorMessagePayload = (client: ExtendedClient) => {
    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(client.i18n.__("error.title"))
        .setDescription(client.i18n.__("error.description"));

    return {
        embeds: [embed]
    };
}

const getFollowMessagePayload = async (client: ExtendedClient, member: GuildMember, lastActivity: VoiceActivityDocument) => {
    client.i18n.setLocale(member.guild.preferredLocale);

    const avatar = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const imageHex = await useImageHex(avatar);
    const color = getColorInt(imageHex.Vibrant);

    const activityEndMoment = lastActivity ? lastActivity.to ? moment(lastActivity.to) : moment() : moment()
    const unix = activityEndMoment.unix();

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: member.guild.name,
            iconURL: member.guild.iconURL({ extension: "png", size: 256 })!,
            url: `https://discord.com/channels/${member.guild.id}/${member.voice.channelId}`
        })
        .setTitle(member.user.username)
        .setDescription(client.i18n.__mf("follow.followNotificationDescription", { time: unix }))
        .setThumbnail(avatar);

    return {
        embeds: [embed]
    }
};

const sweepTextChannel = async (client: ExtendedClient, channel: TextChannel) => {
    const popularPrefixes = ['!', '#', '$', '%', '^', '&', '*', '(', ')', '/'];
    const messages = await channel.messages.fetch({ limit: 50 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });

    const messagesToDelete = messages.filter((message: Message) => {
        return popularPrefixes.some(prefix => message.content.startsWith(prefix)) ||
            (message.author.bot && message.attachments && message.attachments.size == 0) ||
            (message.author.bot && message.embeds.length);
    });

    let count = 0;
    const promises = messagesToDelete.map(async (message: Message) => {
        if (!message.deletable) return;
        await message.delete();
        count++;
    });

    await Promise.all(promises).catch(e => console.log(`There was an error when sweeping the channel: ${e}`));
    await attachQuickButtons(client, channel);
    return count;
};

const attachQuickButtons = async (client: ExtendedClient, channel: TextChannel) => {
    client.i18n.setLocale(channel.guild.preferredLocale);

    const lastMessages = await channel.messages.fetch({ limit: 50 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });

    const clientLastMessages = lastMessages.filter(m => m.author.id == client.user!.id) as Collection<string, Message>;
    const lastMessage = clientLastMessages.first();
    if (!lastMessage) return;

    const quickButtonsRows = await getQuickButtonsRows(client, lastMessage);

    const clearComponentsPromises = clientLastMessages.map(async (message: Message) => {
        if (message.components.length > 0 && message.id != lastMessage.id) {
            await message.edit({ components: [] });
        }
    });

    await Promise.all(clearComponentsPromises)
        .catch(e => {
            console.log(`There was an error when clearing components: ${e}`);
        });

    await lastMessage.edit({ components: quickButtonsRows })
        .catch(e => {
            console.log(`There was an error when editing the message: ${e}`);
        });
};

const createMessage = async (message: Message, targetUserId: string | null, name: string | null) => {
    const exists = await getMessage(message.id);
    if (exists) return exists;

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
    if (!message) return null;
    return message;
};

const deleteMessage = async (messageId: string) => {
    await messageModel.deleteOne({
        messageId: messageId
    });

    return true;
};

export { createMessage, getHelpMessagePayload, getRankingMessagePayload, getMessage, deleteMessage, getDailyRewardMessagePayload, getColorMessagePayload, getConfigMessagePayload, attachQuickButtons, getCommitsMessagePayload, sweepTextChannel, getLevelUpMessagePayload, getStatisticsMessagePayload, getUserMessagePayload, useHtmlFile, useImageHex, ImageHexColors, getColorInt, getErrorMessagePayload, getFollowMessagePayload };
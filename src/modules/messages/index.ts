import { ActionRowBuilder, ButtonBuilder, ChannelType, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel, ButtonInteraction, CommandInteraction, UserContextMenuCommandInteraction, User, Message, Collection, EmbedField, GuildMember, StringSelectMenuInteraction, EmbedBuilder, ChatInputCommandInteraction, AnySelectMenuInteraction, UserSelectMenuBuilder, UserSelectMenuInteraction, ModalSubmitInteraction, VoiceChannel, ButtonStyle } from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";
import { getGuild } from "@/modules/guild";
import { SelectMenuOption } from "@/interfaces";
import { getAutoSweepingButton, getLevelRolesButton, getLevelRolesHoistButton, getNotificationsButton, getProfileFollowButton, getProfileTimePublicButton, getQuickButtonsRows, getRankingGuildOnlyButton, getRankingPageDownButton, getRankingPageUpButton, getRankingSettingsButton, getRepoButton, getRoleColorDisableButton, getRoleColorPickButton, getRoleColorUpdateButton, getSelectMessageDeleteButton, getSelectRerollButton } from "@/modules/messages/buttons";
import { getChannelSelect, getRankingSortSelect, getRankingUsersSelect } from "@/modules/messages/selects";
import { getLastCommits } from "@/utils/commits";
import { getSortingByType, runMask, sortings } from "@/modules/user/sortings";
import moment from "moment";
import Vibrant = require('node-vibrant');
import { GetColorName } from 'hex-color-to-color-name';
import { getRanking, getUser } from "@/modules/user";
import { getMemberColorRole } from "@/modules/roles";
import { Message as MessageType } from '@/interfaces/Message';
import messageSchema from "@/modules/schemas/Message";
import mongoose from "mongoose";
import { UserDocument } from "@/modules/schemas/User";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { ErrorEmbed, InformationEmbed, ProfileEmbed, WarningEmbed } from "./embeds";
import { createEphemeralChannel, deleteEphemeralChannel, editEphemeralChannel, getEphemeralChannel, getGuildsEphemeralChannels } from "@/modules/ephemeral-channel";
import clean from "@/utils/clean";
import { config } from "@/config";
import i18n from "@/client/i18n";

import { rankingStore } from "@/stores/rankingStore";
import { profileStore } from "@/stores/profileStore";
import { colorStore } from "@/stores/colorStore";
import { selectOptionsStore } from "@/stores/selectOptionsStore";

interface ImageHexColors {
    Vibrant: string;
    DarkVibrant: string;
}

const messageModel = mongoose.model("Message", messageSchema);

const useImageHex = async (image: string | null) => {
    const defaultColors = { Vibrant: "#373b48", DarkVibrant: "#373b48" };

    if (!image)
        return defaultColors;

    const colors = await Vibrant.from(image).getPalette();

    if (!colors.Vibrant || !colors.DarkVibrant)
        return defaultColors;

    return {
        Vibrant: colors.Vibrant.hex,
        DarkVibrant: colors.DarkVibrant.hex
    };
}

const getColorInt = (color: string) => {
    return parseInt(color.slice(1), 16);
}

const getConfigMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction) => {
    const { guild } = interaction;
    if (!guild)
        return getErrorMessagePayload();

    const sourceGuild = await getGuild(guild);
    if (!sourceGuild)
        return getErrorMessagePayload();

    const owner = await client.users.fetch(guild.ownerId);
    const textChannels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText);
    const currentDefault = textChannels.find((channel) => channel.id == sourceGuild.channelId);

    if (!textChannels.size) {
        await owner?.send({
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("config.noValidChannels"))
            ]
        });
        return getErrorMessagePayload();
    }

    const defaultChannelOptions = textChannels.map((channel) => {
        return {
            label: `#${channel.name}`,
            description: i18n.__mf("config.channelWatchers", {
                count: (channel instanceof ThreadChannel ? 0 : channel.members.filter(member => !member.user.bot).size)
            }),
            value: channel.id
        }
    });

    const notificationsButton = await getNotificationsButton(client, sourceGuild);
    const levelRolesButton = await getLevelRolesButton(client, sourceGuild);
    const levelRolesHoistButton = await getLevelRolesHoistButton(client, sourceGuild);
    const autoSweepingButton = await getAutoSweepingButton(client, sourceGuild);
    const channelSelect = await getChannelSelect(currentDefault as TextChannel, defaultChannelOptions as SelectMenuOption[]);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(channelSelect);
    const row2 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(levelRolesButton, levelRolesHoistButton);
    const row3 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(notificationsButton, autoSweepingButton);

    return {
        components: [row, row2, row3],
    };
}

const getUserMessagePayload = async (client: ExtendedClient, interaction: ButtonInteraction | UserContextMenuCommandInteraction) => {
    const { targetUserId } = profileStore.get(interaction.user.id);

    const targetUser = client.users.cache.get(targetUserId ? targetUserId : interaction.user.id);
    if (!targetUser) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
            ]
        };
    }

    const sourceTargetUser = await getUser(targetUser);
    const sourceUser = await getUser(interaction.user);

    if (!sourceUser || !sourceTargetUser) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
            ]
        };
    }

    const selfCall = sourceUser.userId === targetUser.id;
    const renderedUser = sourceTargetUser ? sourceTargetUser : sourceUser;

    const colors = await useImageHex(renderedUser.avatarUrl);
    const profileTimePublic = await getProfileTimePublicButton(client, renderedUser);
    const followButton = await getProfileFollowButton(client, sourceUser, sourceTargetUser);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(selfCall ? profileTimePublic : followButton);

    const embed = await ProfileEmbed(client, renderedUser, colors, selfCall);

    return {
        embeds: [embed],
        components: [row],
        ephemeral: true
    };
}

const getLevelUpMessagePayload = async (client: ExtendedClient, user: User, guild: Guild) => {
    i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    if (!sourceUser)
        return getErrorMessagePayload();

    const colors = await useImageHex(sourceUser.avatarUrl);

    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(i18n.__("notifications.levelUpTitle"))
        .setDescription(i18n.__mf("notifications.levelUpDescription", { userId: sourceUser.userId, level: sourceUser.stats.level }))
        .setFields(
            {
                name: i18n.__("notifications.levelField"),
                value: `\`\`\`${sourceUser.stats.level}\`\`\``,
                inline: true
            },
            {
                name: i18n.__("notifications.todayVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.day.time.voice / 3600))}H\`\`\``,
                inline: true
            },
            {
                name: i18n.__("notifications.weekVoiceTimeField"),
                value: `\`\`\`${Math.round((sourceUser.week.time.voice / 3600))}H\`\`\``,
                inline: true
            }
        )
        .setThumbnail("https://i.imgur.com/cSTkdFG.png");

    return {
        embeds: [embed],
        flags: [4096]
    };
};

const getCommitsMessagePayload = async (client: ExtendedClient) => {
    const projectPackage = await import("../../../package.json");
    const repo = projectPackage.repository.url.split("/").slice(-2).join("/");

    const commits = await getLastCommits(repo, 6)
        .catch(() => {
            return null;
        });

    if (!commits)
        return getErrorMessagePayload();

    const fields: EmbedField[] = commits.map((commit: any) => ({
        name: `${commit.author.login}`,
        value: `\`\`\`${commit.commit.message}\`\`\`[commit](${commit.html_url}) - ${moment(commit.commit.author.date).format("DD/MM/YYYY HH:mm")}`,
        inline: true
    }));

    const embed = InformationEmbed()
        .setTitle(i18n.__mf("commits.title", { count: commits.length }))
        .setFields(fields)
        .setFooter({
            iconURL: client.user?.avatarURL({ extension: "png" }) || undefined,
            text: `${projectPackage.name.charAt(0).toUpperCase() + projectPackage.name.slice(1)} (v.${projectPackage.version})`
        })

    return {
        embeds: [embed]
    };
};

const getHelpMessagePayload = async (client: ExtendedClient) => {
    const clientUserAvatar = client.user?.avatarURL({
        extension: "png"
    }) || null;
    const color = await useImageHex(clientUserAvatar);

    const embed = InformationEmbed()
        .setColor(getColorInt(color.Vibrant))
        .setTitle(i18n.__("help.title"))
        .setDescription(i18n.__("help.description"))
        .setFields([
            {
                name: i18n.__("help.faqQuestion1"),
                value: i18n.__("help.faqAnswer1"),
                inline: true
            },
            {
                name: i18n.__("help.faqQuestion2"),
                value: i18n.__("help.faqAnswer2"),
                inline: true
            },
            {
                name: i18n.__("help.faqQuestion3"),
                value: i18n.__("help.faqAnswer3"),
            }
        ])
        .setThumbnail(clientUserAvatar)
        .setImage("https://i.imgur.com/ncCPDum.png")
        .setFooter({
            text: i18n.__("help.footer")
        });

    const repoButton = await getRepoButton();
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(repoButton);

    return {
        embeds: [embed],
        components: [row]
    }
}

const getColorMessagePayload = async (client: ExtendedClient, interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction) => {
    const colorState = colorStore.get(interaction.user.id);

    if (!interaction.guild)
        return getErrorMessagePayload();

    const roleColor = getMemberColorRole(interaction.member as GuildMember);
    const defaultColor = await useImageHex(interaction.user.avatarURL({ extension: "png" }))
        .then(color => color.Vibrant);

    if (!colorState.color) {
        colorState.color = roleColor ? roleColor.hexColor : defaultColor;
    }

    const roleColorUpdateButton = await getRoleColorUpdateButton();
    const roleColorPickButton = getRoleColorPickButton();
    const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(roleColorPickButton, roleColorUpdateButton);

    if (roleColor) {
        const roleColorDisableButton = getRoleColorDisableButton();
        row.addComponents(roleColorDisableButton);
    }

    const colorImageUrl = `https://singlecolorimage.com/get/${(colorState.color).split("#").at(-1)}/400x400`;

    const embed = InformationEmbed()
        .setColor(getColorInt(colorState.color))
        .setTitle(i18n.__("color.title"))
        .setDescription(i18n.__("color.description"))
        .setThumbnail(colorImageUrl)
        .setFooter({
            iconURL: colorImageUrl,
            text: i18n.__mf("color.current", {
                hex: colorState.color,
                name: GetColorName(colorState.color)
            })
        });

    return {
        embeds: [embed],
        components: [row]
    };
};

const getRankingMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | UserSelectMenuInteraction | ModalSubmitInteraction) => {
    const { guildOnly, page, userIds, sorting, perPage } = rankingStore.get(interaction.user.id);
    const guild = (guildOnly && interaction.guild) ? interaction.guild : undefined;

    const selectOptions: SelectMenuOption[] = sortings.map((sorting) => ({
        label: i18n.__(`rankingSortings.label.${sorting.label}`),
        description: i18n.__(`rankingSortings.range.${sorting.range}`),
        value: sorting.type,
        emoji: sorting.emoji
    }));

    const sortingType = getSortingByType(sorting);
    const { onPage, pagesCount } = await getRanking(sortingType, page, perPage, guild, userIds);

    rankingStore.get(interaction.user.id).pagesCount = pagesCount;

    const fields: EmbedField[] = onPage.map((user: UserDocument, index: number) => {
        const relativeIndex = index + 1 + ((page - 1) * perPage);
        const indexString = () => {
            switch (relativeIndex) {
                case 1:
                    return "`🥇.`";
                case 2:
                    return "`🥈.`";
                case 3:
                    return "`🥉.`";
                default:
                    return `\`${relativeIndex}.\``;
            }
        }

        return {
            name: `${indexString()} ${user.username} ${user.userId === interaction.user.id ? i18n.__("ranking.you") : ""}`,
            value: `\`\`\`${runMask(client, sortingType.mask, user)}\`\`\``,
            inline: true
        };
    });

    const sortSelectMenu = await getRankingSortSelect(sortingType, selectOptions);
    const usersSelectMenu = getRankingUsersSelect();
    const pageUpButton = await getRankingPageUpButton(page > 1 ? false : true);
    const pageDownButton = await getRankingPageDownButton(page < pagesCount ? false : true);
    const guildOnlyButton = await getRankingGuildOnlyButton(guild ? true : false);
    const settingsButton = await getRankingSettingsButton();

    const sortRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(sortSelectMenu);
    const usersRow = new ActionRowBuilder<UserSelectMenuBuilder>()
        .addComponents(usersSelectMenu);
    const paginationRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(pageUpButton, pageDownButton);

    if (interaction.guild && !userIds.length) {
        paginationRow.addComponents(guildOnlyButton);
    }

    paginationRow.addComponents(settingsButton);

    return {
        embeds: [
            InformationEmbed()
                .setTitle(i18n.__mf("ranking.title"))
                .setFields(fields)
                .setDescription(!onPage.length ? i18n.__("ranking.empty") : null)
                .setFooter({
                    text: i18n.__mf("ranking.footer", { page: page, pages: pagesCount })
                })
        ],
        components: [sortRow, usersRow, paginationRow]
    }
};

const getDailyRewardMessagePayload = async (client: ExtendedClient, user: User, guild: Guild) => {
    i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    if (!sourceUser) return getErrorMessagePayload();

    const colors = await useImageHex(sourceUser.avatarUrl);

    const embed = InformationEmbed()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(i18n.__("notifications.dailyRewardTitle"))
        .setDescription(i18n.__mf("notifications.dailyRewardDescription", { userId: sourceUser.userId }))
        .setThumbnail("https://em-content.zobj.net/thumbs/60/microsoft/74/birthday-cake_1f382.png")
        .setFields([
            {
                name: i18n.__("notifications.dailyRewardField"),
                value: `\`\`\`${client.numberFormat.format(config.dailyRewardExperience)} EXP\`\`\``,
                inline: true
            },
            {
                name: i18n.__("notifications.weekVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.week.time.voice / 3600))}H\`\`\``,
                inline: true
            },
            {
                name: i18n.__("notifications.monthVoiceTimeField"),
                value: `\`\`\`${(Math.round(sourceUser.month.time.voice / 3600))}H\`\`\``,
                inline: true
            },
        ]);

    return {
        embeds: [embed],
        flags: [4096]
    };
};

const getSelectMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction, reveal?: boolean) => {
    const selectOptionsState = selectOptionsStore.get(interaction.user.id);

    const selected = reveal ? selectOptionsState.options[Math.floor(Math.random() * selectOptionsState.options.length)] : '';
    if (reveal) {
        selectOptionsState.results = [...selectOptionsState.results, selected];
    }

    // TODO
    // Do this more efficiently
    const optionsSorted = selectOptionsState.options.sort((a: string, b: string) => {
        const aCount = selectOptionsState.results.filter((result: string) => result === a).length;
        const bCount = selectOptionsState.results.filter((result: string) => result === b).length;

        return bCount - aCount;
    });

    const embed = InformationEmbed()
        .setTitle(reveal ? `🎯  ${selected}` : `✨  ${i18n.__("select.selecting")}`)
        .setDescription(i18n.__("select.description"))
        .setFields(
            optionsSorted.map((option: string, index) => {
                const count = selectOptionsState.results.filter((result: string) => result === option).length;
                return {
                    name: `${index + 1}. ${option}`,
                    value: count ? `\`\`\`${count}\`\`\`` : `\`\`\`\u200b\`\`\``,
                    inline: true
                }
            })
        )

    const selectMessageDeleteButton = await getSelectMessageDeleteButton(!reveal);
    const selectRerollButton = await getSelectRerollButton(!reveal);
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(selectRerollButton, selectMessageDeleteButton);

    return {
        embeds: [embed],
        components: [row]
    };
}

const getEphemeralChannelMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild)
        return getErrorMessagePayload();

    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');
    const timeout = interaction.options.getInteger('timeout');

    if (!channel)
        return getErrorMessagePayload();

    const exists = await getEphemeralChannel(channel.id);

    if (!(interaction.guild?.channels.cache.get(channel.id)?.type === ChannelType.GuildText)) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("utils.textChannelOnly"))
            ]
        };
    }

    if (subcommand === 'create') {
        if (!timeout)
            return getErrorMessagePayload();

        if (exists) {
            return {
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("ephemeralChannel.alreadyExists"))
                ]
            }
        }

        const guildExisting = await getGuildsEphemeralChannels(interaction.guild.id);

        if (guildExisting.length >= 2) {
            return {
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("ephemeralChannel.limitReached"))
                ]
            }
        }

        const ephemeralChannel = await createEphemeralChannel(interaction.guild.id, channel.id, timeout);
        return {
            embeds: [
                InformationEmbed()
                    .setDescription(i18n.__mf("ephemeralChannel.created", {
                        channelId: ephemeralChannel.channelId,
                        timeout: ephemeralChannel.timeout.toString()
                    }))
            ]
        }
    } else if (subcommand === 'edit') {
        if (!timeout)
            return getErrorMessagePayload();

        const ephemeralChannel = await editEphemeralChannel(channel.id, timeout);

        if (!ephemeralChannel) {
            return {
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("ephemeralChannel.notFound"))
                ]
            }
        }

        return {
            embeds: [
                InformationEmbed()
                    .setDescription(i18n.__mf("ephemeralChannel.edited", {
                        channelId: ephemeralChannel.channelId,
                        timeout: ephemeralChannel.timeout.toString()
                    }))
            ]
        }
    } else if (subcommand === 'delete') {
        const result = await deleteEphemeralChannel(channel.id);

        if (!result) {
            return {
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("ephemeralChannel.notFound"))
                ]
            }
        }

        return {
            embeds: [
                InformationEmbed()
                    .setDescription(i18n.__mf("ephemeralChannel.deleted", { channelId: channel.id }))
            ]
        }
    } else {
        return getErrorMessagePayload();
    }
};

const getEvalMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
    const code = interaction.options.getString(`code`);
    const depth = interaction.options.getInteger(`depth`);

    const embed = new EmbedBuilder();
    try {
        const evaled = await eval(code ?? '');
        const output = await clean(evaled, depth ?? 0);

        embed
            .setTitle(i18n.__("evaluation.title"))
            .setDescription(`**${i18n.__("evaluation.input")}**\n\`\`\`js\n${code}\n\`\`\`\n**${i18n.__("evaluation.output")}**\n\`\`\`js\n${output}\n\`\`\``)
            .setColor('Blurple');
    } catch (e) {
        embed
            .setTitle(i18n.__("evaluation.title"))
            .setDescription(`**${i18n.__("evaluation.input")}**\n\`\`\`js\n${code}\n\`\`\`\n**${i18n.__("evaluation.output")}**\n\`\`\`js\n${e}\n\`\`\``)
            .setColor('Red');
    }

    return {
        embeds: [embed]
    }
};

const getFollowMessagePayload = async (client: ExtendedClient, member: GuildMember, lastActivity: VoiceActivityDocument) => {
    i18n.setLocale(member.guild.preferredLocale);

    const avatar = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const imageHex = await useImageHex(avatar);
    const color = getColorInt(imageHex.Vibrant);

    const activityEndMoment = lastActivity ? lastActivity.to ? moment(lastActivity.to) : moment() : moment()
    const unix = activityEndMoment.unix();
    const channelUrl = `https://discord.com/channels/${member.guild.id}/${member.voice.channelId}`;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: member.guild.name,
            iconURL: member.guild.iconURL({ extension: "png", size: 256 }) || undefined,
            url: channelUrl
        })
        .setTitle(member.user.username)
        .setDescription(i18n.__mf("follow.followNotificationDescription", { time: unix }))
        .setThumbnail(avatar);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(channelUrl)
                .setLabel(i18n.__("follow.join"))
        );

    return {
        embeds: [embed],
        components: [row]
    }
};

const getErrorMessagePayload = () => {
    const embed = ErrorEmbed()
        .setTitle(i18n.__("error.title"))
        .setDescription(i18n.__("error.description"));

    return {
        embeds: [embed]
    };
}

const sweepTextChannel = async (client: ExtendedClient, channel: TextChannel | VoiceChannel) => {
    const messages = await channel.messages.fetch({ limit: 50 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });

    const messagesToDelete = messages.filter((message: Message) => {
        return config.emptyGuildSweepBotPrefixesList.some(prefix => message.content.startsWith(prefix)) ||
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

const attachQuickButtons = async (client: ExtendedClient, channel: TextChannel | VoiceChannel) => {
    i18n.setLocale(channel.guild.preferredLocale);

    const lastMessages = await channel.messages.fetch({ limit: 50 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });

    const clientLastMessages = lastMessages.filter(m => m.author.id == client.user?.id && !m.interaction) as Collection<string, Message>;
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
    const exists = await getMessage({
        messageId: message.id,
    });
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

const getMessage = async (message: Partial<MessageType>) => {
    const response = await messageModel
        .find(message)
        .sort({ createdAt: -1 }) // if there are multiple messages, get the latest one
        .limit(1)
        .exec();
    
    return response[0];
}

const deleteMessage = async (messageId: string) => {
    await messageModel.deleteOne({
        messageId: messageId
    });

    return true;
};

export { createMessage, getSelectMessagePayload, getMessage, getHelpMessagePayload, getRankingMessagePayload, getEphemeralChannelMessagePayload, getEvalMessagePayload, deleteMessage, getDailyRewardMessagePayload, getColorMessagePayload, getConfigMessagePayload, attachQuickButtons, getCommitsMessagePayload, sweepTextChannel, getLevelUpMessagePayload, getUserMessagePayload, useImageHex, ImageHexColors, getColorInt, getErrorMessagePayload, getFollowMessagePayload };
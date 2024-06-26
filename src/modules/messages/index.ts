import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { config } from "@/config";
import { ActivityStreak, ProfilePages, SelectMenuOption, SortingRanges, SortingTypes, Streak } from "@/interfaces";
import { Message as MessageType, MessageTypeIds } from '@/interfaces/Message';
import {
    createEphemeralChannel,
    deleteEphemeralChannel,
    editEphemeralChannel,
    getEphemeralChannel,
    getGuildsEphemeralChannels,
    syncEphemeralChannelMessages
} from "@/modules/ephemeral-channel";
import { getGuild, getGuildsCount } from "@/modules/guild";
import {
    getAutoSweepingButton,
    getLevelRolesButton,
    getLevelRolesHoistButton,
    getNotificationsButton,
    getQuickButtonsRows,
    getRankingPageDownButton,
    getRankingPageUpButton,
    getRankingSettingsButton,
    getRepoButton,
    getRoleColorDisableButton,
    getRoleColorPickButton,
    getRoleColorUpdateButton,
    getSelectMessageDeleteButton,
    getSelectRerollButton
} from "@/modules/messages/buttons";
import {
    getChannelSelect,
    getRankingRangeSelect,
    getRankingSortSelect,
    getRankingUsersSelect
} from "@/modules/messages/selects";
import { getGuildTresholdRole, getLevelRoleThreshold, getMemberColorRole } from "@/modules/roles";
import messageSchema, { MessageDocument } from "@/modules/schemas/Message";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { getUser, getUsersCount } from "@/modules/user";
import { getRanking, getSortingByType, getUserGuildStatistics, runMask } from '@/modules/user-guild-statistics';
import clean from "@/utils/clean";
import { getLastCommits } from "@/utils/commits";
import {
    ActionRowBuilder,
    AnySelectMenuInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    ChatInputCommandInteraction,
    Collection,
    CommandInteraction,
    EmbedBuilder,
    EmbedField,
    Guild,
    GuildMember,
    HeadingLevel,
    Message,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextChannel,
    ThreadChannel,
    User,
    UserContextMenuCommandInteraction,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
    VoiceChannel,
    bold,
    codeBlock,
    heading,
    userMention
} from "discord.js";
import { GetColorName } from 'hex-color-to-color-name';
import moment from "moment";
import mongoose from "mongoose";
import { ErrorEmbed, InformationEmbed, WarningEmbed } from "./embeds";

import { colorStore } from "@/stores/colorStore";
import { profileStore } from "@/stores/profileStore";
import { rankingStore } from "@/stores/rankingStore";
import { selectOptionsStore } from "@/stores/selectOptionsStore";
import Colors from "@/utils/colors";
import { getLocalizedDateRange } from "@/utils/date";
import { KnownLinks } from "./knownLinks";
import ProfilePagesManager from "./pages/profilePagesManager";
import Vibrant = require('node-vibrant');

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

    const sourceGuild = await getGuild(guild.id);
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

    const notificationsButton = getNotificationsButton({ guild: sourceGuild })
    const levelRolesButton = getLevelRolesButton({ guild: sourceGuild })
    const levelRolesHoistButton = getLevelRolesHoistButton({ guild: sourceGuild })
    const autoSweepingButton = getAutoSweepingButton({ guild: sourceGuild })
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

const getProfileMessagePayload = async (client: ExtendedClient, interaction: ButtonInteraction | UserContextMenuCommandInteraction | StringSelectMenuInteraction | UserSelectMenuInteraction) => {
    const { targetUserId, page } = profileStore.get(interaction.user.id);
    if (!targetUserId) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
                    .setImage(KnownLinks.EMBED_SPACER)
            ],
            components: [],
            ephemeral: true
        };
    }

    const targetUser = await client.users.fetch(targetUserId);
    if (!targetUser) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
                    .setImage(KnownLinks.EMBED_SPACER)
            ],
            components: [],
            ephemeral: true
        };
    }

    const sourceTargetUser = await getUser(targetUser);
    const sourceUser = await getUser(interaction.user);

    if (!sourceUser || !sourceTargetUser) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
                    .setImage(KnownLinks.EMBED_SPACER)
            ],
            components: [],
            ephemeral: true
        };
    }

    const selfCall = sourceUser.userId === targetUser.id;
    const renderedUser = sourceTargetUser ? sourceTargetUser : sourceUser;

    const colors = await useImageHex(renderedUser.avatarUrl);
    const manager = await new ProfilePagesManager({
        client,
        colors,
        renderedUser,
        sourceUser,
        targetUser: sourceTargetUser,
        guild: interaction.guild || undefined,
        selfCall
    })
        .init();

    return {
        ...await manager.getPagePayloadByType(page || ProfilePages.About),
        ephemeral: true,
    }
}

const getLevelUpMessagePayload = async (client: ExtendedClient, user: User, guild: Guild, level: number) => {
    i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    if (!sourceUser)
        return getErrorMessagePayload();

    const userGuildStatistics = await getUserGuildStatistics({ userId: sourceUser.userId, guildId: guild.id });
    const colors = await useImageHex(sourceUser.avatarUrl);
    const guildTresholdRole = await getGuildTresholdRole({
        client,
        guildId: guild.id,
        threshold: getLevelRoleThreshold(level)
    });

    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(i18n.__("notifications.levelUpTitle"))
        .setDescription(i18n.__mf("notifications.levelUpDescription", { userId: sourceUser.userId, roleId: guildTresholdRole?.id }))
        .setFields(
            {
                name: i18n.__("notifications.levelField"),
                value: codeBlock(level.toString()),
                inline: true
            },
            {
                name: i18n.__("notifications.todayVoiceTimeField"),
                value: codeBlock(`${Math.round(userGuildStatistics.day.time.voice / 3600)}H`),
                inline: true
            },
            {
                name: i18n.__("notifications.weekVoiceTimeField"),
                value: codeBlock(`${Math.round(userGuildStatistics.week.time.voice / 3600)}H`),
                inline: true
            }
        )
        .setThumbnail(KnownLinks.SPARKLES);

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
        name: commit.author.login,
        value: `${codeBlock(commit.commit.message)}[commit](${commit.html_url}) - ${moment(commit.commit.author.date).format("DD/MM/YYYY HH:mm")}`,
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
                value: codeBlock(i18n.__("help.faqAnswer1")),
                inline: true
            },
            {
                name: i18n.__("help.faqQuestion2"),
                value: codeBlock(i18n.__("help.faqAnswer2")),
                inline: true
            },
            {
                name: i18n.__("help.faqQuestion3"),
                value: codeBlock(i18n.__("help.faqAnswer3")),
            }
        ])
        .setThumbnail(clientUserAvatar)
        .setImage(KnownLinks.QUICK_BUTTONS)
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

    const roleColorUpdateButton = getRoleColorUpdateButton();
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
        components: [row],
    };
};

const getRankingMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | UserSelectMenuInteraction | ModalSubmitInteraction | MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction) => {
    const { page, userIds, sorting, range, targetUserId } = rankingStore.get(interaction.user.id);
    const targetId = targetUserId || interaction.user.id;
    const guild = interaction.guild;

    if (!guild)
        return getErrorMessagePayload();

    const sortingType = getSortingByType(sorting, range);
    const { data, metadata } = await getRanking({ sourceUserId: interaction.user.id, guild });

    const fields = data.map((statistics) => (
        {
            name: statistics.position.toString() + ".",
            value: `<@${statistics.user.userId}> ${statistics.user.userId === targetId ? i18n.__("ranking.you") : ""}\n${codeBlock(runMask(client, sortingType.mask, statistics))}`,
            inline: true
        }
    ));

    const sortSelectMenu = await getRankingSortSelect(sortingType,
        Object.values(SortingTypes)
            .map((sortingType: SortingTypes) => {
                return {
                    label: i18n.__(`rankingSortings.label.${sortingType}`),
                    value: sortingType,
                    default: sortingType === sorting,
                }
            })
    );
    const rangeSelectMenu = await getRankingRangeSelect(sortingType,
        Object.values(SortingRanges)
            .map((rangeType: SortingRanges) => {
                return {
                    label: i18n.__(`rankingSortings.range.${rangeType}`),
                    value: rangeType,
                    default: rangeType === range,
                }
            })
    );
    const usersSelectMenu = getRankingUsersSelect(userIds);
    const pageUpButton = getRankingPageUpButton(page <= 1);
    const pageDownButton = getRankingPageDownButton(page >= metadata.total);
    const settingsButton = getRankingSettingsButton();

    const sortRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(sortSelectMenu);
    const rangeRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(rangeSelectMenu);
    const usersRow = new ActionRowBuilder<UserSelectMenuBuilder>()
        .addComponents(usersSelectMenu);
    const paginationRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(pageUpButton, pageDownButton, settingsButton);

    const targetUser = await client.users.fetch(targetId);
    const color = await useImageHex(targetUser.displayAvatarURL({ extension: "png", size: 256 }))
        .then(colors => getColorInt(colors.Vibrant));

    return {
        embeds: [
            InformationEmbed()
                .setColor(color)
                .setThumbnail(targetUser.displayAvatarURL({ extension: "png", size: 256 }))
                .setAuthor({
                    name: guild.name,
                    iconURL: guild.iconURL({ extension: "png", size: 256 }) || undefined
                })
                .setFields(fields)
                .setDescription(
                    heading(userMention(targetId), HeadingLevel.Two) + `\n` +
                    heading(bold(i18n.__mf("ranking.title", {
                        emoji: sortingType.emoji,
                        range: i18n.__(`rankingSortings.range.${sortingType.range}`),
                        sorting: i18n.__(`rankingSortings.label.${sortingType.type}`),
                    })), HeadingLevel.Three)+ `\n\n` +
                    (!data.length ? i18n.__("ranking.empty") : '')
                )
                .setFooter({
                    text: i18n.__mf("ranking.footer", { page: page, pages: metadata.total || 1 })
                })
        ],
        components: [sortRow, rangeRow, usersRow, paginationRow]
    }
};

const getDailyRewardMessagePayload = async (client: ExtendedClient, user: User, guild: Guild, streak: ActivityStreak) => {
    i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    if (!sourceUser) return getErrorMessagePayload();

    const colors = await useImageHex(sourceUser.avatarUrl);

    const embed = InformationEmbed()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(i18n.__("notifications.dailyRewardTitle"))
        .setDescription(i18n.__mf("notifications.dailyRewardDescription", { userId: sourceUser.userId }))
        .setThumbnail(KnownLinks.BIRTHDAY_CAKE)
        .setFields([
            {
                name: i18n.__("notifications.dailyRewardField"),
                value: codeBlock(`${client.numberFormat.format(config.experience.voice.dailyActivityReward)} EXP`),
                inline: true
            }
        ]);

    if (streak.streak && streak.streak.value > 1) {
        embed.addFields([
            {
                name: i18n.__("notifications.voiceStreakField"),
                value: formatStreakField(streak.streak),
                inline: true
            }
        ]);
    }

    embed.addFields([
        {
            name: i18n.__("notifications.nextVoiceStreakRewardField"),
            value: formatNextStreakField(streak.nextSignificant - (streak.streak?.value || 0) || 3),
            inline: true
        }
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
                    value: count ? codeBlock(count.toString()) : codeBlock(`\u200b`),
                    inline: true
                }
            })
        )

    const selectMessageDeleteButton = getSelectMessageDeleteButton(!reveal);
    const selectRerollButton = getSelectRerollButton(!reveal);
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
    const timeout = interaction.options.getInteger('timeout') ?? undefined;
    const keepMessagesWithReactions = interaction.options.getBoolean('keep-messages-with-reactions') ?? undefined;

    switch(subcommand) {
        case 'create': {
            if (!timeout || !channel)
                return getErrorMessagePayload();

            const exists = await getEphemeralChannel(channel.id);
            if (exists) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("ephemeralChannel.alreadyExists"))
                    ]
                }
            }

            if (!(interaction.guild?.channels.cache.get(channel.id)?.type === ChannelType.GuildText)) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("utils.textChannelOnly"))
                    ]
                };
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

            await createEphemeralChannel({ guildId: interaction.guild.id, keepMessagesWithReactions, channelId: channel.id, timeout });
            return {
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("ephemeralChannel.created"))
                ]
            }
        }

        case 'edit': {
            if (!channel)
                return getErrorMessagePayload();

            const ephemeralChannel = await editEphemeralChannel({ channelId: channel.id, update: { timeout, keepMessagesWithReactions } });
            if (!ephemeralChannel) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("ephemeralChannel.notFound"))
                    ]
                }
            }

            await syncEphemeralChannelMessages(client, ephemeralChannel);
            return {
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("ephemeralChannel.edited"))
                ]
            }
        }

        case 'list': {
            const guildExisting = await getGuildsEphemeralChannels(interaction.guild.id);
            const fields = guildExisting.map((ephemeralChannel) => {
                const channel = interaction.guild?.channels.cache.get(ephemeralChannel.channelId);
                return {
                    name: channel?.name || 'Unknown',
                    value: `${i18n.__("ephemeralChannel.timeout")}: \`${ephemeralChannel.timeout}min\`\n${i18n.__("ephemeralChannel.keepMessagesWithReactions")}: \`${ephemeralChannel.keepMessagesWithReactions ? '✔' : '❌'}\``,
                    inline: false,
                }
            });
            const embed = InformationEmbed()
                .setTitle(i18n.__("ephemeralChannel.listTitle"))
                .setFields(fields);

            if (!fields.length) {
                embed.setDescription(i18n.__("ephemeralChannel.empty"));
            }

            return {
                embeds: [embed]
            }
        }

        case 'delete': {
            if (!channel) {
                return getErrorMessagePayload();
            }

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
        }

        default: {
            return getErrorMessagePayload();
        }
    }
};

const getEvalMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
    const code = interaction.options.getString(`code`);
    const depth = interaction.options.getInteger(`depth`);

    const embed = new EmbedBuilder();
    try {
        const result = await eval(code ?? '');
        const output = await clean(result, depth ?? 0);

        embed
            .setTitle(i18n.__("evaluation.title"))
            .setDescription(`${bold(i18n.__("evaluation.input"))}\n\`\`\`js\n${code}\n\`\`\`\n${bold(i18n.__("evaluation.output"))}\n\`\`\`js\n${output}\n\`\`\``)
            .setColor(Colors.Blurple);
    } catch (e) {
        embed
            .setTitle(i18n.__("evaluation.title"))
            .setDescription(`${bold(i18n.__("evaluation.input"))}\n\`\`\`js\n${code}\n\`\`\`\n${bold(i18n.__("evaluation.output"))}\n\`\`\`js\n${e}\n\`\`\``)
            .setColor(Colors.Red);
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

const getSignificantVoiceActivityStreakMessagePayload = async (client: ExtendedClient, member: GuildMember, streak: ActivityStreak) => {
    i18n.setLocale(member.guild.preferredLocale);

    const avatar = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const imageHex = await useImageHex(avatar);
    const color = getColorInt(imageHex.Vibrant);
    
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(i18n.__("notifications.voiceStreakTitle"))
        .setDescription(i18n.__mf("notifications.voiceStreakDescription", {
            userId: member.id
        }))
        .setThumbnail(KnownLinks.FIRE)
        
    if (config.experience.voice.significantActivityStreakReward > 0) {
        embed.addFields([
            {
                name: i18n.__("notifications.voiceStreakRewardField"),
                value: codeBlock(`${client.numberFormat.format(config.experience.voice.significantActivityStreakReward)} EXP`),
                inline: true,
            }
        ]);
    }

    embed.addFields([{
        name: i18n.__("notifications.voiceStreakField"),
        value: formatStreakField(streak.streak),
        inline: true,
    }, {
        name: i18n.__("notifications.nextVoiceStreakRewardField"),
        value: formatNextStreakField(streak.nextSignificant - (streak.streak?.value || 0)),
        inline: true,
    }]);

    return {
        embeds: [embed],
        flags: [4096]
    }
}

const getInviteNotificationMessagePayload = async (client: ExtendedClient, guild: Guild) => {
    i18n.setLocale(guild.preferredLocale);

    const embed = InformationEmbed()
        .setColor(Colors.Red)
        .setTitle(i18n.__("notifications.inviteTitle"))
        .setDescription(i18n.__mf("notifications.inviteDescription", {
            invite: client.getInvite(),
            repo: (await import("../../../package.json")).repository.url,
        }))
        .setFields([
            {
                name: i18n.__("notifications.usersField"),
                value: codeBlock(client.numberFormat.format(await getUsersCount())),
                inline: true
            },
            {
                name: i18n.__("notifications.guildsField"),
                value: codeBlock(client.numberFormat.format(await getGuildsCount())),
                inline: true
            },
        ])
        .setThumbnail(KnownLinks.ROCKET);

    return {
        embeds: [embed],
        flags: [4096]
    };
}

const getErrorMessagePayload = () => {
    const embed = ErrorEmbed()
        .setTitle(i18n.__("error.title"))
        .setDescription(i18n.__("error.description"));

    return {
        embeds: [embed],
        flags: [4096]
    };
}

const sweepTextChannel = async (client: ExtendedClient, channel: TextChannel | VoiceChannel) => {
    const messages = await channel.messages.fetch({ limit: 100 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });

    const messagesToDelete = messages.filter((message: Message) => (
        config.emptyGuildSweepBotPrefixesList.some(prefix => message.content.startsWith(prefix)) || message.author.bot 
    ));

    return Promise.all(messagesToDelete.map((message: Message) => message.delete()))
        .then(async deleted => {
            await attachQuickButtons(client, channel.id);
            return deleted.length;
        })
        .catch(e => {
            console.log(`There was an error when sweeping the channel: ${e}`);
            return 0;
        });
};

const attachQuickButtons = async (client: ExtendedClient, channelId: string) => {
    const channel = await client.channels.fetch(channelId) as TextChannel;
    i18n.setLocale(channel.guild.preferredLocale);

    const lastMessages = await channel.messages.fetch({ limit: 100 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });
    const clientMessages = lastMessages.filter(m => m.author.id === client.user?.id && !m.interaction);
    const lastMessage = clientMessages.first();
    if (!lastMessage) return;

    await Promise.all(
        clientMessages.map((message: Message) => {
            if (message.components.length > 0) 
                return message.edit({ components: [] });
        })
    )
        .catch(e => {
            console.log(`There was an error when clearing components: ${e}`);
        });

    await lastMessage.edit({ components: await getQuickButtonsRows() })
        .catch(e => {
            console.log(`There was an error when editing the message: ${e}`);
        });
};

interface CreateMessageProps {
    message: Message;
    typeId: MessageTypeIds;
    targetUserId?: string;
}

const createMessage = async ({ message, typeId, targetUserId }: CreateMessageProps) => {
    const exists = await getMessage({
        messageId: message.id,
    });
    if (exists) return exists;

    const newMessage = new messageModel({
        messageId: message.id,
        channelId: message.channel.id,
        targetUserId,
        typeId,
    });

    await newMessage.save();
    return newMessage;
};

const getMessage = async (message: Partial<MessageType>): Promise<MessageDocument | undefined> => {
    const response = await messageModel.aggregate([
        { $match: message },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
    ]);
    return response.at(0);
}

const deleteMessage = async (messageId: string) => {
    return messageModel.deleteOne({
        messageId: messageId
    })
};

const deleteMessages = async (channelId: string) => {
    return messageModel.deleteMany({
        channelId: channelId
    });
}

const formatStreakField = (streak?: Streak, includeDateRange?: boolean) => {
    return streak && streak.value > 1 ?
        `${includeDateRange ? getLocalizedDateRange(streak.startedAt, streak.date) : ''}${codeBlock(i18n.__n("notifications.voiceStreakFormat", streak.value || 0))}`
        :
        codeBlock(i18n.__("utils.lack"));
}

const formatNextStreakField = (daysTillNext: number) => {
    return daysTillNext ? codeBlock(i18n.__n("notifications.voiceStreakInFormat", daysTillNext)) : codeBlock(i18n.__("utils.never"));
}

export { ImageHexColors, attachQuickButtons, createMessage, deleteMessage, deleteMessages, formatNextStreakField, formatStreakField, getColorInt, getColorMessagePayload, getCommitsMessagePayload, getConfigMessagePayload, getDailyRewardMessagePayload, getEphemeralChannelMessagePayload, getErrorMessagePayload, getEvalMessagePayload, getFollowMessagePayload, getHelpMessagePayload, getInviteNotificationMessagePayload, getLevelUpMessagePayload, getMessage, getProfileMessagePayload, getRankingMessagePayload, getSelectMessagePayload, getSignificantVoiceActivityStreakMessagePayload, sweepTextChannel, useImageHex };


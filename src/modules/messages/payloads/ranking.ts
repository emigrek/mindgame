import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { SortingRanges, SortingTypes } from "@/interfaces";
import { getRankingPageDownButton, getRankingPageUpButton, getRankingSettingsButton } from "@/modules/messages/buttons";
import { getRankingRangeSelect, getRankingSortSelect, getRankingUsersSelect } from "@/modules/messages/selects";
import { getRanking, getSortingByType, runMask } from '@/modules/user-guild-statistics';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, HeadingLevel, MessageContextMenuCommandInteraction, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, UserContextMenuCommandInteraction, UserSelectMenuBuilder, UserSelectMenuInteraction, bold, codeBlock, heading, userMention } from "discord.js";
import { InformationEmbed } from "@/modules/messages/embeds";

import { rankingStore } from "@/stores/rankingStore";
import { useImageHex, getColorInt } from "@/modules/messages/colors";
import { getErrorMessagePayload } from "@/modules/messages/error";

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

export { getRankingMessagePayload };

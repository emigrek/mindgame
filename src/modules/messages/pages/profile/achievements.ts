import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { AchievementManager } from "@/modules/achievement";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { achievementsStore } from "@/stores/achievementsStore";
import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "@discordjs/builders";
import { ButtonStyle, HeadingLevel, heading, userMention } from "discord.js";

export class Achievements extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🏆",
            name: i18n.__("profile.pages.achievements"),
            description: params.guild?.name || "🤔",
            type: ProfilePages.Achievements,
            params,
        })
    }

    async getPayload() {
        return {
            embeds: [await this.getAchievementsEmbed()],
            components: [this.getDisplaySelectRow(), this.getPaginationButtonsRow()],
        };
    }

    async getAchievementsEmbed() {
        const { renderedUser, sourceUser, colors, guild, client, targetUser } = this.params;
        // Keyed by the viewer, like the pagination and display handlers that write it
        const state = achievementsStore.get(sourceUser.userId);

        if (!guild) {
            throw new Error("Guild is required for statistics page");
        }

        const allFields = await new AchievementManager({
            client,
            userId: targetUser.userId,
            guildId: guild.id,
        })
            .getAll(state.display)
            .then(
                (achievements) => achievements
                    .sort((a, b) => b.level - a.level)
                    .map((achievement) => achievement.embedField)
            );
        
        state.pages = Math.max(1, Math.ceil(allFields.length / state.perPage));
        state.page = Math.min(Math.max(1, state.page), state.pages);

        const { display, page, pages, perPage } = state;
        const fields = allFields.slice((page - 1) * perPage, page * perPage);

        const noAchievementsField = {
            name: " ",
            value: i18n.__("achievements.misc.noAchievements"),
            inline: false,
        };

        return BaseProfileEmbed({ user: renderedUser, colors })
            .setDescription(heading(userMention(renderedUser.userId), HeadingLevel.Two))
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            })
            .addFields([
                this.embedTitleField,
                ...(fields.length ? fields : [noAchievementsField]),
            ])
            .setFooter({
                text: i18n.__mf("achievements.misc.footer", {
                    page,
                    pages,
                    displayCount: allFields.length,
                    display: display.map((d) => i18n.__(`achievements.display.${d}`)).join(", "),
                }),
            });
    }

    getPaginationButtonsRow() {
        const { page, pages } = achievementsStore.get(this.params.sourceUser.userId);

        const up = new ButtonBuilder()
            .setCustomId("achievementsPageUp")
            .setDisabled(page <= 1)
            .setLabel(i18n.__("ranking.pageUpButtonLabel"))
            .setStyle(ButtonStyle.Secondary);

        const down = new ButtonBuilder()
            .setCustomId("achievementsPageDown")
            .setDisabled(page >= pages)
            .setLabel(i18n.__("ranking.pageDownButtonLabel"))
            .setStyle(ButtonStyle.Secondary);

        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(up, down);
    }

    getDisplaySelectRow() {
        const { display } = achievementsStore.get(this.params.sourceUser.userId);

        const options = [
            {
                label: i18n.__("achievements.display.all"),
                value: "all",
                default: display.includes("all")
            },
            {
                label: i18n.__("achievements.display.unlocked"),
                value: "unlocked",
                default: display.includes("unlocked"),
            },
            {
                label: i18n.__("achievements.display.inprogress"),
                value: "inprogress",
                default: display.includes("inprogress"),
            },
        ];

        return new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("achievementsDisplaySelect")
                    .setMinValues(1)
                    .setMaxValues(3)
                    .addOptions(options)
            );
    }

    get visible() {
        const { guild } = this.params;
        return !!guild;
    }
} 
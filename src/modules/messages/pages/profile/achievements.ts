import i18n from "@/client/i18n";
import { AchievementType, ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { AchievementManager, BaseAchievement } from "@/modules/achievement";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { achievementsStore } from "@/stores/achievementsStore";
import { ActionRowBuilder, StringSelectMenuBuilder } from "@discordjs/builders";
import { HeadingLevel, bold, heading, userMention } from "discord.js";

const displayFilter = (display: string[], achievement: BaseAchievement<AchievementType>) => {
    if (display.includes("all")) return true;
    if (display.includes("unlocked") && achievement.level > 0) return true;
    if (display.includes("inprogress") && achievement.level === 0) return true;
    return false;
}

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
        const displayRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(this.getDisplaySelect());

        return {
            embeds: [await this.getAchievementsEmbed()],
            components: [displayRow],
        };
    }

    async getAchievementsEmbed() {
        const { renderedUser, colors, guild, client, targetUser } = this.params;
        const { display } = achievementsStore.get(renderedUser.userId);

        if (!guild) {
            throw new Error("Guild is required for statistics page");
        }

        const fields = await new AchievementManager({
            client,
            userId: targetUser.userId,
            guildId: guild.id,
        })
            .getAll()
            .then(
                (achievements) => achievements
                    .filter((achievement) => displayFilter(display, achievement))
                    .sort((a, b) => b.level - a.level)
                    .map((achievement) => achievement.embedField)
            );

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
            ]);
    }

    getDisplaySelect() {
        const { display } = achievementsStore.get(this.params.renderedUser.userId);

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

        return new StringSelectMenuBuilder()
            .setCustomId("achievementsDisplaySelect")
            .setMinValues(1)
            .setMaxValues(3)
            .addOptions(options);
    }

    get embedTitleField() {
        return {
            name: bold(`${this.emoji}   ${this.name}`),
            value: bold(" "),
            inline: false,
        }
    }

    get visible() {
        const { guild } = this.params;
        return !!guild;
    }
} 
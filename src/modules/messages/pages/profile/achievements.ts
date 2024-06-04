import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { AchievementManager } from "@/modules/achievement";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { HeadingLevel, bold, heading, userMention } from "discord.js";

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
        };
    }

    async getAchievementsEmbed() {
        const { renderedUser, colors, guild, client, targetUser } = this.params;
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
                    .filter(a => a.level > 0)
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
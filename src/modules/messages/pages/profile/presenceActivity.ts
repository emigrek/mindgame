import i18n from "@/client/i18n";
import {BaseProfilePage, ProfilePages} from "@/interfaces";
import {ProfilePagePayloadParams} from "@/interfaces/ProfilePage";
import {getColorInt} from "@/modules/messages";
import {BaseProfileEmbed} from "@/modules/messages/embeds";
import {getUserGuildStatistics} from "@/modules/user-guild-statistics";
import {getLocalizedDateTypeRange} from "@/utils/date";
import {bold, codeBlock, heading, HeadingLevel, userMention} from "discord.js";

export class PresenceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🖥",
            name: i18n.__("profile.pages.presenceActivity"),
            description: params.guild?.name  || "🤔",
            type: ProfilePages.PresenceActivity,
            params,
        })
    }

    async getPayload() {
        return {
            embeds: [await this.getPresenceActivity()],
        };
    }

    async getPresenceActivity() {
        const { renderedUser, colors, selfCall, guild } = this.params;
        if (!guild) {
            throw new Error("Guild is required for presence activity page");
        }

        const userGuildStatistics = await getUserGuildStatistics({ userId: renderedUser.userId, guildId: guild.id });

        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setDescription(heading(userMention(renderedUser.userId), HeadingLevel.Two))
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("notifications.todayVoiceTimeField"),
                    value: `${getLocalizedDateTypeRange('day')}\n${codeBlock(`${Math.round(userGuildStatistics.day.time.presence/3600)}H`)}`,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.weekVoiceTimeField"),
                    value: `${getLocalizedDateTypeRange('week')}\n${codeBlock(`${Math.round(userGuildStatistics.week.time.presence/3600)}H`)}`,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.monthVoiceTimeField"),
                    value: `${getLocalizedDateTypeRange('month')}\n${codeBlock(`${Math.round(userGuildStatistics.month.time.presence/3600)}H`)}`,
                    inline: true,
                },
            ]);

        if (selfCall) {
            embed.setColor(getColorInt(colors.DarkVibrant));
            embed.setFooter({
                text: i18n.__("profile.visibilityNotification")
            })
        }

        return embed;
    }

    get embedTitleField() {
        return {
            name: bold(`${this.emoji}   ${this.name}`),
            value: bold(" "),
            inline: false,
        }
    }

    get visible() {
        const { selfCall, guild } = this.params;
        if (!selfCall) return false;
        return Boolean(guild);
    }
}
import i18n from "@/client/i18n";
import {ProfilePages} from "@/interfaces";
import {BaseProfilePage} from "@/interfaces/BaseProfilePage";
import {ProfilePagePayloadParams} from "@/interfaces/ProfilePage";
import {BaseProfileEmbed} from "@/modules/messages/embeds";
import {getUserGuildStatistics} from "@/modules/user-guild-statistics";
import {getLocalizedDateTypeRange} from "@/utils/date";
import {bold, codeBlock, heading, HeadingLevel, userMention} from "discord.js";

export class VoiceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🔊",
            name: i18n.__("profile.pages.voiceActivity"),
            description: params.guild?.name || "🤔",
            type: ProfilePages.VoiceActivity,
            params,
        });
    }

    async getPayload() {
        return {
            embeds: [await this.getVoiceActivityEmbed()],
        };
    }

    async getVoiceActivityEmbed() {
        const { renderedUser, colors, guild } = this.params;
        if (!guild) {
            throw new Error("Guild is required for voice activity page");
        }

        const userGuildStatistics = await getUserGuildStatistics({ userId: renderedUser.userId, guildId: guild.id });

        return BaseProfileEmbed({ user: renderedUser, colors })
            .setDescription(heading(userMention(renderedUser.userId), HeadingLevel.Two))
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("notifications.todayVoiceTimeField"),
                    value: `${getLocalizedDateTypeRange('day')}\n${codeBlock(`${Math.round(userGuildStatistics.day.time.voice/3600)}H`)}`,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.weekVoiceTimeField"),
                    value: `${getLocalizedDateTypeRange('week')}\n${codeBlock(`${Math.round(userGuildStatistics.week.time.voice/3600)}H`)}`,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.monthVoiceTimeField"),
                    value: `${getLocalizedDateTypeRange('month')}\n${codeBlock(`${Math.round(userGuildStatistics.month.time.voice/3600)}H`)}`,
                    inline: true,
                },
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
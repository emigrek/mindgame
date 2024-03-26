import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { getLocalizedDateRange } from "@/modules/messages";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { getUserGuildStatistics } from "@/modules/user-guild-statistics";

export class VoiceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🔊",
            name: i18n.__("profile.pages.voiceActivity"),
            description: params.guild?.name || "🤔",
            type: ProfilePages.VoiceActivity,
            position: 3,
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

        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("notifications.todayVoiceTimeField"),
                    value: `${getLocalizedDateRange('day')}\n\`\`\`${Math.round(userGuildStatistics.day.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.weekVoiceTimeField"),
                    value: `${getLocalizedDateRange('week')}\n\`\`\`${Math.round(userGuildStatistics.week.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.monthVoiceTimeField"),
                    value: `${getLocalizedDateRange('month')}\n\`\`\`${Math.round(userGuildStatistics.month.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
            ]);

        return embed;
    }

    get embedTitleField() {
        return {
            name: `**${this.emoji}   ${this.name}**`,
            value: `** **`,
            inline: false,
        }
    }

    get visible() {
        const { guild } = this.params;
        return !!guild;
    }
}
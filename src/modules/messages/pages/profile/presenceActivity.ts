import i18n from "@/client/i18n";
import { BaseProfilePage, ProfilePages } from "@/interfaces";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { getColorInt, getLocalizedDateRange } from "@/modules/messages";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { getUserGuildStatistics } from "@/modules/user-guild-statistics";

export class PresenceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🖥",
            name: i18n.__("profile.pages.presenceActivity"),
            description: params.guild?.name  || "🤔",
            type: ProfilePages.PresenceActivity,
            position: 5,
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
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("notifications.todayVoiceTimeField"),
                    value: `${getLocalizedDateRange('day')}\n\`\`\`${Math.round(userGuildStatistics.day.time.presence/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.weekVoiceTimeField"),
                    value: `${getLocalizedDateRange('week')}\n\`\`\`${Math.round(userGuildStatistics.week.time.presence/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.monthVoiceTimeField"),
                    value: `${getLocalizedDateRange('month')}\n\`\`\`${Math.round(userGuildStatistics.month.time.presence/3600)}H\`\`\``,
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
            name: `**${this.emoji}   ${this.name}**`,
            value: `** **`,
            inline: false,
        }
    }

    get visible() {
        const { selfCall, guild } = this.params;
        if (!selfCall) return false;
        if (!guild) return false;
        return true;
    }
}
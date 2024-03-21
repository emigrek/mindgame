import i18n from "@/client/i18n";
import { BaseProfilePage, ProfilePages } from "@/interfaces";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { getColorInt, getLocalizedDateRange } from "@/modules/messages";
import { BaseProfileEmbed } from "@/modules/messages/embeds";

export class PresenceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🖥",
            name: i18n.__("profile.pages.presenceActivity"),
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
        const { renderedUser, colors, selfCall } = this.params;

        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("notifications.todayVoiceTimeField"),
                    value: `${getLocalizedDateRange('day')}\n\`\`\`${Math.round(renderedUser.day.time.presence/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.weekVoiceTimeField"),
                    value: `${getLocalizedDateRange('week')}\n\`\`\`${Math.round(renderedUser.week.time.presence/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.monthVoiceTimeField"),
                    value: `${getLocalizedDateRange('month')}\n\`\`\`${Math.round(renderedUser.month.time.presence/3600)}H\`\`\``,
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

    get visible() {
        const { selfCall } = this.params;
        return selfCall || false;
    }
}
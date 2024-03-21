import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { getLocalizedDateRange } from "../..";

export class VoiceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🔊",
            name: i18n.__("profile.pages.voiceActivity"),
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
        const { renderedUser, colors } = this.params;

        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("notifications.todayVoiceTimeField"),
                    value: `${getLocalizedDateRange('day')}\n\`\`\`${Math.round(renderedUser.day.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.weekVoiceTimeField"),
                    value: `${getLocalizedDateRange('week')}\n\`\`\`${Math.round(renderedUser.week.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("notifications.monthVoiceTimeField"),
                    value: `${getLocalizedDateRange('month')}\n\`\`\`${Math.round(renderedUser.month.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
            ]);

        return embed;
    }
}
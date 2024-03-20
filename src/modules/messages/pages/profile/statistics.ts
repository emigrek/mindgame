import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfileStatisticsEmbed } from "@/modules/messages/embeds";

export class Statistics extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "📊",
            name: i18n.__("profile.pages.statistics"),
            type: ProfilePages.Statistics,
            position: 1,
            params,
        })
    }

    async getPayload() {
        const { renderedUser, colors } = this.params;
        const embed = await ProfileStatisticsEmbed({ user: renderedUser, colors });
        return {
            embeds: [embed],
        };
    }
}
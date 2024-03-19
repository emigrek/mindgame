import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfileStatisticsEmbed } from "@/modules/messages/embeds";
import { ProfilePages } from "@/stores/profileStore";

export class Statistics extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super(ProfilePages.Statistics, "📊", params);
    }

    async getPayload() {
        const { renderedUser, colors } = this.params;
        const embed = await ProfileStatisticsEmbed(renderedUser, colors);
        return {
            embeds: [embed],
        };
    }
}
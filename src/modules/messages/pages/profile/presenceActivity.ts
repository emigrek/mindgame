import { BaseProfilePage } from "@/interfaces";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfileTempPresenceTimeStatisticsEmbed } from "@/modules/messages/embeds";
import { ProfilePages } from "@/stores/profileStore";

export class PresenceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super(ProfilePages.PresenceActivity, "📅", params);
    }

    async getPayload() {
        const { selfCall, renderedUser, colors } = this.params;
        const embed = await ProfileTempPresenceTimeStatisticsEmbed(renderedUser, colors, selfCall);
        
        return {
            embeds: [embed],
        };
    }

    get visible() {
        const { selfCall } = this.params;
        return selfCall || false;
    }
}
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfileTempVoiceTimeStatisticsEmbed } from "@/modules/messages/embeds";
import { ProfilePages } from "@/stores/profileStore";

export class VoiceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super(ProfilePages.VoiceActivity, "🔊", params);
    }

    async getPayload() {
        const { client, renderedUser, colors } = this.params;
        const embed = await ProfileTempVoiceTimeStatisticsEmbed(client, renderedUser, colors);
        
        return {
            embeds: [embed],
        };
    }
}
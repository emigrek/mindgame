import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfileVoiceActivityEmbed } from "@/modules/messages/embeds";

export class VoiceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🔊",
            name: i18n.__("profile.pages.voiceActivity"),
            type: ProfilePages.VoiceActivity,
            position: 3,
            params: params,
        });
    }

    async getPayload() {
        const { renderedUser, colors } = this.params;
        const embed = await ProfileVoiceActivityEmbed({ user: renderedUser, colors });
        
        return {
            embeds: [embed],
        };
    }
}
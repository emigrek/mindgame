import i18n from "@/client/i18n";
import { BaseProfilePage, ProfilePages } from "@/interfaces";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfilePresenceActivityEmbed } from "@/modules/messages/embeds";

export class PresenceActivity extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🖥",
            name: i18n.__("profile.pages.presenceActivity"),
            type: ProfilePages.PresenceActivity,
            position: 5,
            params: params,
        })
    }

    async getPayload() {
        const { selfCall, renderedUser, colors } = this.params;
        const embed = await ProfilePresenceActivityEmbed({ user: renderedUser, colors, selfCall });
        
        return {
            embeds: [embed],
        };
    }

    get visible() {
        const { selfCall } = this.params;
        return selfCall || false;
    }
}
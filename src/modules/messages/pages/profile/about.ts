import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { getProfileFollowButton } from "@/modules/messages/buttons";
import { ProfileAboutEmbed } from "@/modules/messages/embeds";
import { ProfilePages } from "@/stores/profileStore";
import { ActionRowBuilder, ButtonBuilder, MessageCreateOptions } from "discord.js";

export class About extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super(ProfilePages.About, "📝", params);
    }

    async getPayload(): Promise<MessageCreateOptions> {
        const { client, renderedUser, colors, targetUser, sourceUser } = this.params;

        const embed = await ProfileAboutEmbed(client, renderedUser, colors);
        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(await getProfileFollowButton(client, sourceUser, targetUser));

        return {
            embeds: [embed],
            components: [buttons],
        };
    }

    get visible() {
        return true;
    }
}
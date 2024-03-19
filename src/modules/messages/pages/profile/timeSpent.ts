import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { getProfileTimePublicButton } from "@/modules/messages/buttons";
import { ProfileTimeStatisticsEmbed } from "@/modules/messages/embeds";
import { ProfilePages } from "@/stores/profileStore";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export class TimeSpent extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super(ProfilePages.TimeSpent, "⏳", params);
    }

    async getPayload() {
        const { client, renderedUser, colors, selfCall } = this.params;
        const embed = await ProfileTimeStatisticsEmbed(renderedUser, colors, selfCall);
        const button = await getProfileTimePublicButton(client, renderedUser);
        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);
        return {
            embeds: [embed],
            components: [buttons],
        };
    }

    get visible() {
        const { selfCall, renderedUser } = this.params;
        return selfCall || renderedUser.stats.time.public;
    }
}
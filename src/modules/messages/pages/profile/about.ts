import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { formatLastActivityDetails, getUserLastActivityDetails } from "@/modules/activity";
import { getFollowers } from "@/modules/follow";
import { getProfileFollowButton } from "@/modules/messages/buttons";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { KnownLinks } from "@/modules/messages/knownLinks";
import { ActionRowBuilder, ButtonBuilder, MessageCreateOptions } from "discord.js";

export class About extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "📝",
            name: i18n.__("profile.pages.about"),
            type: ProfilePages.About,
            position: 0,
            params,
        });
    }

    async getPayload(): Promise<MessageCreateOptions> {
        const { client, targetUser, sourceUser } = this.params;

        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(await getProfileFollowButton(client, sourceUser, targetUser));
            
        return {
            embeds: [await this.getAboutEmbed()], 
            components: [buttons]
        };
    }

    async getAboutEmbed() {
        const { client, renderedUser, colors } = this.params;

        const userLastActivityDetails = await getUserLastActivityDetails(client, renderedUser);
        const followers = await getFollowers(renderedUser.userId).then(followers => followers.length);
        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setDescription(formatLastActivityDetails(userLastActivityDetails))
            .setFields([
                {
                    name: i18n.__("profile.followers"),
                    value: `\`\`\`${followers}\`\`\``,
                    inline: true,
                },
            ])
            .setImage(KnownLinks.EMBED_SPACER);

        return embed;
    }

    get visible() {
        return true;
    }
}
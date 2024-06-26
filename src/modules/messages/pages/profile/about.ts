import i18n from "@/client/i18n";
import {ProfilePages} from "@/interfaces";
import {BaseProfilePage} from "@/interfaces/BaseProfilePage";
import {ProfilePagePayloadParams} from "@/interfaces/ProfilePage";
import {
    clientStatusToEmoji,
    formatLastActivityDetails,
    getUserClients,
    getUserLastActivityDetails
} from "@/modules/activity";
import {getFollowers} from "@/modules/follow";
import {getProfileFollowButton} from "@/modules/messages/buttons";
import {BaseProfileEmbed} from "@/modules/messages/embeds";
import {KnownLinks} from "@/modules/messages/knownLinks";
import {
    ActionRowBuilder,
    ButtonBuilder,
    codeBlock,
    heading,
    HeadingLevel,
    MessageCreateOptions,
    userMention
} from "discord.js";

export class About extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "📝",
            name: i18n.__("profile.pages.about"),
            type: ProfilePages.About,
            params,
        });
    }

    async getPayload(): Promise<MessageCreateOptions> {
        const { targetUser, sourceUser } = this.params;

        if (targetUser.userId === sourceUser.userId) {
            return {
                embeds: [await this.getAboutEmbed()],
            };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(await getProfileFollowButton({ sourceUserId: sourceUser.userId, targetUserId: targetUser.userId }));
            
        return {
            embeds: [await this.getAboutEmbed()], 
            components: [buttons]
        };
    }

    async getAboutEmbed() {
        const { client, renderedUser, colors } = this.params;

        const userLastActivityDetails = await getUserLastActivityDetails(client, renderedUser.userId);
        const followers = await getFollowers(renderedUser.userId).then(followers => followers.length);
        const { clients, mostUsed } = await getUserClients(renderedUser.userId);
        const clientsEmojis = clients.map(client => clientStatusToEmoji(client));
        const mostUsedEmoji = mostUsed ? clientStatusToEmoji(mostUsed) : undefined;

        return BaseProfileEmbed({ user: renderedUser, colors })
            .setDescription(
                heading(userMention(renderedUser.userId), HeadingLevel.Two) +
                formatLastActivityDetails(userLastActivityDetails)
            )
            .setFields([
                {
                    name: i18n.__("profile.followers"),
                    value: codeBlock(followers.toString()),
                    inline: true,
                },
                {
                    name: i18n.__("profile.mostUsedClient"),
                    value: codeBlock(mostUsedEmoji || i18n.__("utils.lack")),
                    inline: true,
                },
                {
                    name: i18n.__("profile.clients"),
                    value: codeBlock(clientsEmojis.length ? clientsEmojis.join(", ") : i18n.__("utils.lack")),
                    inline: true,
                },
            ])
            .setImage(KnownLinks.EMBED_SPACER);
    }

    get visible() {
        return true;
    }
}
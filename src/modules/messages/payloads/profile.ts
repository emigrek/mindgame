import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { getUser } from "@/modules/user";
import { ButtonInteraction, StringSelectMenuInteraction, UserContextMenuCommandInteraction, UserSelectMenuInteraction } from "discord.js";
import { WarningEmbed } from "@/modules/messages/embeds";

import { profileStore } from "@/stores/profileStore";
import { KnownLinks } from "@/modules/messages/knownLinks";
import ProfilePagesManager from "@/modules/messages/pages/profilePagesManager";
import { useImageHex } from "@/modules/messages/colors";

// No ephemeral flag: callers defer ephemerally or edit, and edits reject it
const getProfileMessagePayload = async (client: ExtendedClient, interaction: ButtonInteraction | UserContextMenuCommandInteraction | StringSelectMenuInteraction | UserSelectMenuInteraction) => {
    const { targetUserId, page } = profileStore.get(interaction.user.id);
    if (!targetUserId) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
                    .setImage(KnownLinks.EMBED_SPACER)
            ],
            components: []
        };
    }

    const targetUser = await client.users.fetch(targetUserId).catch(() => null);
    if (!targetUser) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
                    .setImage(KnownLinks.EMBED_SPACER)
            ],
            components: []
        };
    }

    const sourceTargetUser = await getUser(targetUser);
    const sourceUser = await getUser(interaction.user);

    if (!sourceUser || !sourceTargetUser) {
        return {
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("profile.notFound"))
                    .setImage(KnownLinks.EMBED_SPACER)
            ],
            components: []
        };
    }

    const selfCall = sourceUser.userId === targetUser.id;
    const renderedUser = sourceTargetUser ? sourceTargetUser : sourceUser;

    const colors = await useImageHex(renderedUser.avatarUrl);
    const manager = await new ProfilePagesManager({
        client,
        colors,
        renderedUser,
        sourceUser,
        targetUser: sourceTargetUser,
        guild: interaction.guild || undefined,
        selfCall
    })
        .init();

    return {
        ...await manager.getPagePayloadByType(page || ProfilePages.About),
    }
}

export { getProfileMessagePayload };

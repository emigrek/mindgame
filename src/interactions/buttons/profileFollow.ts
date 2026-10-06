import i18n from "@/client/i18n";
import { Button } from "@/interfaces";
import { createFollow, deleteFollow, getFollow } from "@/modules/follow";
import { getErrorMessagePayload, getProfileMessagePayload } from "@/modules/messages";
import { InformationEmbed } from "@/modules/messages/embeds";
import { profileStore, restoreProfileState } from "@/stores/profileStore";
import { ButtonInteraction, MessageFlags } from "discord.js";

const profileFollow: Button = {
    customId: `profileFollow`,
    run: async (client, interaction, ...args) => {
        await interaction.deferUpdate();
        restoreProfileState(interaction.user.id, args);

        const { targetUserId } = profileStore.get(interaction.user.id);
        if (!targetUserId) {
            await interaction.followUp({ ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral });
            return;
        }

        const following = await getFollow(interaction.user.id, targetUserId);

        if (!following) {
            const follow = await createFollow(interaction.user.id, targetUserId);

            if (!follow) {
                await interaction.followUp({
                    embeds: [
                        InformationEmbed()
                            .setDescription(i18n.__mf("follow.alreadyFollowing", {
                                tag: `<@${targetUserId}>`
                            }))
                    ],
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            await interaction.followUp({
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__mf("follow.followed", {
                            tag: `<@${targetUserId}>`
                        }))
                ],
                flags: MessageFlags.Ephemeral
            });
        } else {
            await deleteFollow(interaction.user.id, targetUserId);

            await interaction.followUp({
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__mf("follow.unfollowed", {
                            tag: `<@${targetUserId}>`
                        }))
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileFollow;
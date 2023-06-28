import { ButtonInteraction } from "discord.js";
import { Button } from "@/interfaces";
import { createFollow, deleteFollow, getFollow } from "@/modules/follow";
import { getErrorMessagePayload, getUserMessagePayload } from "@/modules/messages";
import { InformationEmbed } from "@/modules/messages/embeds";
import { profileStore } from "@/stores/profileStore";
import i18n from "@/client/i18n";

const profileFollow: Button = {
    customId: `profileFollow`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const { targetUserId } = profileStore.get(interaction.user.id);
        if (!targetUserId) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
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
                    ephemeral: true
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
                ephemeral: true
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
                ephemeral: true
            });
        }

        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileFollow;
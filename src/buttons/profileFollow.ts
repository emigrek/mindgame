import { ButtonInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { createFollow, deleteFollow, getFollow } from "../modules/follow";
import { getUserMessagePayload } from "../modules/messages";

const profileFollow: Button = {
    customId: `profileFollow`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const profileAttachment = interaction.message.attachments.first();
        if(!profileAttachment) 
            return;

        const targetUserId = profileAttachment.name.split('.png').shift()!;
        const following = await getFollow(interaction.user.id, targetUserId);

        if(!following) {
            const follow = await createFollow(interaction.user.id, targetUserId);

            if(!follow) {
                await interaction.followUp({
                    content: client.i18n.__mf("follow.alreadyFollowing", {
                        tag: `<@${targetUserId}>`
                    }), ephemeral: true
                });
                return;
            }

            await interaction.followUp({
                content: client.i18n.__mf("follow.followed", {
                    tag: `<@${targetUserId}>`
                }), ephemeral: true
            });
        } else {
            await deleteFollow(interaction.user.id, targetUserId);
            await interaction.followUp({
                content: client.i18n.__mf("follow.unfollowed", {
                    tag: `<@${targetUserId}>`
                }), ephemeral: true
            });
        }

        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction, targetUserId);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileFollow;
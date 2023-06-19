import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { ContextMenu } from "../interfaces";
import { createFollow } from "../modules/follow";

const followContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Follow`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.user.id === interaction.targetId)
            return;

        const follow = await createFollow(interaction.user.id, interaction.targetId);
        if (!follow) {
            await interaction.followUp({
                content: client.i18n.__mf("follow.alreadyFollowing", {
                    tag: `<@${interaction.targetId}>`
                }), ephemeral: true
            });
            return;
        }

        await interaction.followUp({
            content: client.i18n.__mf("follow.followed", {
                tag: `<@${interaction.targetId}>`
            }), ephemeral: true
        });
    }
};

export default followContext;
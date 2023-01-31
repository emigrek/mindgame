import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { ContextMenu } from "../interfaces";
import { createFollow, deleteFollow } from "../modules/follow";
import { withGuildLocale } from "../modules/locale";

const unfollowContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Unfollow`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        if(interaction.user.id === interaction.targetId)
            return;
        if(interaction.guild) {
            await withGuildLocale(client, interaction.guild!);
        }
        await interaction.deferReply({ ephemeral: true });
        await deleteFollow(interaction.user.id, interaction.targetId);
        await interaction.followUp({ content: client.i18n.__mf("follow.unfollowed", {
            tag: `<@${interaction.targetId}>`
        }), ephemeral: true });
    }
};

export default unfollowContext;
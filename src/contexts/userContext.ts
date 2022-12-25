import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu, User } from "../interfaces";
import { useHtmlFile, useImageHex } from "../modules/messages";
import { layoutLarge, userProfile } from "../modules/messages/templates";
import { getUser } from "../modules/user";
import chroma from "chroma-js";

const userContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show user profile`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        const { targetUser } = interaction as UserContextMenuCommandInteraction;
        const sourceUser = await getUser(targetUser) as User;
        const selfCall = targetUser.id === interaction.user.id;

        await interaction.deferReply({ ephemeral: true });

        const colors = await useImageHex(sourceUser.avatarUrl);
        const userProfileHtml = await userProfile(client, sourceUser, colors, selfCall);
        const file = await useHtmlFile(layoutLarge(userProfileHtml, colors));

        await interaction.followUp({ files: [file], ephemeral: true });
    }
};

export default userContext;
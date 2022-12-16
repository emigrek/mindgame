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

        await interaction.deferReply({ ephemeral: true });

        const color = await useImageHex(sourceUser.avatarUrl);
        const bgColor = chroma(color).darken(0.4).hex();

        const userProfileHtml = await userProfile(client, sourceUser, color, bgColor);
        const file = await useHtmlFile(layoutLarge(userProfileHtml, color, bgColor));

        await interaction.followUp({ files: [file], ephemeral: true });
    }
};

export default userContext;
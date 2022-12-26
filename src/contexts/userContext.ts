import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu, User } from "../interfaces";
import { useHtmlFile, useImageHex } from "../modules/messages";
import { layoutLarge, userProfile } from "../modules/messages/templates";
import { getUser } from "../modules/user";

const userContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show user profile`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const { targetUser } = interaction as UserContextMenuCommandInteraction;
        const sourceUser = await getUser(targetUser) as User;

        if(!sourceUser) {
            await interaction.followUp({ content: client.i18n.__("profile.notFound"), ephemeral: true });
            return;
        }

        const selfCall = targetUser.id === interaction.user.id;
        const colors = await useImageHex(sourceUser.avatarUrl);
        const userProfileHtml = await userProfile(client, sourceUser, colors, selfCall);

        const file = await useHtmlFile(layoutLarge(userProfileHtml, colors));
        await interaction.followUp({ files: [file], ephemeral: true });
    }
};

export default userContext;
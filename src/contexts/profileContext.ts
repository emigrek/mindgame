import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu } from "../interfaces";
import { getUserMessagePayload, useHtmlFile, useImageHex } from "../modules/messages";
import { assignLevelRolesInGuild, assignUserLevelRole } from "../modules/roles";
import { getUser } from "../modules/user";

const profileContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show user profile`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        await assignUserLevelRole(client, interaction.user, interaction.guild!);
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as UserContextMenuCommandInteraction);
        await interaction.followUp({ ...profileMessagePayload, ephemeral: true });
    }
};

export default profileContext;
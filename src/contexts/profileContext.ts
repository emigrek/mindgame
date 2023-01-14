import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu } from "../interfaces";
import { withGuildLocale } from "../modules/locale";
import { getUserMessagePayload, useHtmlFile, useImageHex } from "../modules/messages";
import { assignLevelRolesInGuild, assignUserLevelRole } from "../modules/roles";
import { getUser } from "../modules/user";

const profileContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show user profile`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        if(interaction.guild) {
            await withGuildLocale(client, interaction.guild!);
        }
        await interaction.deferReply({ ephemeral: true });

        const profileMessagePayload = await getUserMessagePayload(client, interaction as UserContextMenuCommandInteraction, interaction.targetId);
        await interaction.followUp({ ...profileMessagePayload, ephemeral: true });
    }
};

export default profileContext;
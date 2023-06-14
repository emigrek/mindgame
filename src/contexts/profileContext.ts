import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu } from "../interfaces";
import { withGuildLocale } from "../modules/locale";
import { getErrorMessagePayload, getUserMessagePayload } from "../modules/messages";

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
        if(!profileMessagePayload) {
            const errorMessage = getErrorMessagePayload(client);
            await interaction.followUp(errorMessage);
            return;
        }

        await interaction.followUp(profileMessagePayload);
    }
};

export default profileContext;
import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu } from "../interfaces";
import { withGuildLocale } from "../modules/locale";
import { getUserMessagePayload } from "../modules/messages";

const profileContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show user profile`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        if(interaction.guild) {
            await withGuildLocale(client, interaction.guild!);
        }

        const profileMessagePayload = await getUserMessagePayload(client, interaction as UserContextMenuCommandInteraction, interaction.targetId);
        await interaction.followUp(profileMessagePayload);
    }
};

export default profileContext;
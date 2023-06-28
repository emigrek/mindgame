import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { ContextMenu } from "@/interfaces";
import { getErrorMessagePayload, getStatisticsMessagePayload } from "@/modules/messages";

const guildStatisticsContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('statistics')
        .setType(ApplicationCommandType.Message)
        .setDMPermission(false),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if(!interaction.guild) {
            await interaction.followUp(getErrorMessagePayload());
            return;
        }

        const guildStatisticsPayload = await getStatisticsMessagePayload(client, interaction.guild);
        await interaction.followUp(guildStatisticsPayload);
    }
};

export default guildStatisticsContext;
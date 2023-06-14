import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { ContextMenu } from "../interfaces";
import { getErrorMessagePayload, getStatisticsMessagePayload } from "../modules/messages";
import { getGuild } from "../modules/guild";

const guildStatisticsContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show guild week statistics`)
        .setType(ApplicationCommandType.Message),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        if(!interaction.guild) {
            const errorMessage = getErrorMessagePayload(client);
            await interaction.followUp(errorMessage);
            return;
        }

        const sourceGuild = await getGuild(interaction.guild!);
        if(!sourceGuild) {
            const errorMessage = getErrorMessagePayload(client);
            await interaction.followUp(errorMessage);
            return;
        }

        const guildStatisticsPayload = await getStatisticsMessagePayload(client, interaction.guild!);
        if(!guildStatisticsPayload) {
            const errorMessage = getErrorMessagePayload(client);
            await interaction.followUp(errorMessage);
            return;
        }

        await interaction.followUp(guildStatisticsPayload);
    }
};

export default guildStatisticsContext;
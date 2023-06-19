import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { updateUserStatistics } from "../modules/user";
import { getCommitsMessagePayload } from "../modules/messages";

export const commits: Command = {
    data: new SlashCommandBuilder()
        .setName(`commits`)
        .setDescription(`Sends last source code commits.`),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const commitsMessagePayload = await getCommitsMessagePayload(client);
        await interaction.followUp(commitsMessagePayload);
    }
}
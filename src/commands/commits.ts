import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getCommitsMessagePayload } from "../modules/messages";

export const commits: Command = {
    data: new SlashCommandBuilder()
        .setName(`commits`)
        .setDescription(`Sends last source code commits.`),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const commitsMessagePayload = await getCommitsMessagePayload(client);
        await interaction.followUp(commitsMessagePayload);
    }
}
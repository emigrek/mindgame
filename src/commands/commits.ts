import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { updateUserStatistics } from "../modules/user";
import { getCommitsMessagePayload } from "../modules/messages";
import { withGuildLocale } from "../modules/locale";

export const commits: Command = {
    data: new SlashCommandBuilder()
        .setName(`commits`)
        .setDescription(`Sends last source code commits.`),
    execute: async (client, interaction) => {
        if(interaction.guild) {
            await withGuildLocale(client, interaction.guild!);
        }    
    
        await interaction.deferReply({ ephemeral: true });
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const commitsMessagePayload = await getCommitsMessagePayload(client);
        await interaction.followUp({ ...commitsMessagePayload, ephemeral: true });
    }
}
import { Command } from "../interfaces";
import { getHelpMessagePayload } from "../modules/messages";
import { SlashCommandBuilder } from "@discordjs/builders";

export const help: Command = {
    data: new SlashCommandBuilder()
        .setName(`help`)
        .setDescription(`Sends help message.`),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const helpMessage = await getHelpMessagePayload(client);
        await interaction.followUp(helpMessage);
    }
}
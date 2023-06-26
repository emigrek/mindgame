import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getCommitsMessagePayload } from "../modules/messages";
import i18n from "../client/i18n";

export const commits: Command = {
    data: new SlashCommandBuilder()
        .setName("commits")
        .setDescription(i18n.__("commandLocalizations.commits.description")),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const commitsMessagePayload = await getCommitsMessagePayload(client);
        await interaction.followUp(commitsMessagePayload);
    }
}
import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getRankingMessagePayload } from "../modules/messages";
import i18n from "../client/i18n";

export const ranking: Command = {
    data: new SlashCommandBuilder()
        .setName("ranking")
        .setDescription(i18n.__("commandLocalizations.ranking.description")),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.followUp(rankingMessagePayload);
    }
}
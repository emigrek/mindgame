import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getRankingMessagePayload } from "../modules/messages";
import i18n from "../client/i18n";
import { rankingStore } from "../stores/rankingStore";

export const ranking: Command = {
    data: new SlashCommandBuilder()
        .setName("ranking")
        .setDescription(i18n.__("commandLocalizations.ranking.description")),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.userIds = [];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.followUp(rankingMessagePayload);
    }
}
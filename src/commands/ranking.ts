import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { findUserRankingPage, updateUserStatistics } from "../modules/user";
import { getRankingMessagePayload } from "../modules/messages";

const defaultType = "exp";

export const ranking: Command = {
    data: new SlashCommandBuilder()
        .setName(`ranking`)
        .setDescription(`Show your ranking`),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const page = await findUserRankingPage(client, defaultType, interaction.user!);
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, defaultType, page);
        await interaction.followUp({ ...rankingMessagePayload, ephemeral: true });
    }
}
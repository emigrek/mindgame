import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { findUserRankingPage, updateUserStatistics } from "../modules/user";
import { getRankingMessagePayload } from "../modules/messages";
import { getSortingByType } from "../modules/user/sortings";

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

        const sorting = await getSortingByType(defaultType)
        const page = await findUserRankingPage(client, sorting, interaction.user!);
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, sorting, page);
        await interaction.followUp({ ...rankingMessagePayload, ephemeral: true });
    }
}
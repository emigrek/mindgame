import { getRankingMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";
import { findUserRankingPage, updateUserStatistics } from "../modules/user";
import { StringSelectMenuInteraction } from "discord.js";

export const rankingSortSelect: Select = {
    customId: "rankingSortSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const selected = interaction.values[0];
        const page = await findUserRankingPage(client, selected, interaction.user!);
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction, selected, page);
        await interaction.editReply(rankingMessagePayload);
    }
}
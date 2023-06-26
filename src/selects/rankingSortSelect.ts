import { getRankingMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";
import { StringSelectMenuInteraction } from "discord.js";
import { rankingStore } from "../stores/rankingStore";

export const rankingSortSelect: Select = {
    customId: "rankingSortSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.sorting = interaction.values[0];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
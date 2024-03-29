import { Select } from "@/interfaces";
import { SortingTypes } from "@/interfaces/Sorting";
import { getRankingMessagePayload } from "@/modules/messages";
import { rankingStore } from "@/stores/rankingStore";
import { StringSelectMenuInteraction } from "discord.js";

export const rankingSortSelect: Select = {
    customId: "rankingSortSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.sorting = interaction.values[0] as SortingTypes;
        rankingState.page = 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
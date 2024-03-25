import { Select } from "@/interfaces";
import { SortingRanges } from "@/interfaces/Sorting";
import { getRankingMessagePayload } from "@/modules/messages";
import { rankingStore } from "@/stores/rankingStore";
import { StringSelectMenuInteraction } from "discord.js";

export const rankingRangeSelect: Select = {
    customId: "rankingRangeSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.range = interaction.values[0] as SortingRanges;
        rankingState.page = 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
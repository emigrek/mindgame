import { Select } from "@/interfaces";
import { getRankingMessagePayload } from "@/modules/messages";
import { StringSelectMenuInteraction } from "discord.js";
import { rankingStore } from "@/stores/rankingStore";

export const rankingSortSelect: Select = {
    customId: "rankingSortSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.sorting = interaction.values[0];
        rankingState.page = 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
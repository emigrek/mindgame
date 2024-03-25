import { Select } from "@/interfaces";
import { getRankingMessagePayload } from "@/modules/messages";
import { rankingStore } from "@/stores/rankingStore";
import { UserSelectMenuInteraction } from "discord.js";

export const rankingUsersSelect: Select = {
    customId: "rankingUsersSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.userIds = interaction.values;
        rankingState.page = 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as UserSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
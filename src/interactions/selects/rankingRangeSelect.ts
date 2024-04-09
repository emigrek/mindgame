import {Select} from "@/interfaces";
import {SortingRanges} from "@/interfaces/Sorting";
import {getErrorMessagePayload, getRankingMessagePayload} from "@/modules/messages";
import {rankingStore} from "@/stores/rankingStore";
import {StringSelectMenuInteraction} from "discord.js";
import {findUserRankingPage} from "@/modules/user-guild-statistics/userGuildStatistics";

export const rankingRangeSelect: Select = {
    customId: "rankingRangeSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.editReply(getErrorMessagePayload());
            return;
        }

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.range = interaction.values[0] as SortingRanges;
        rankingState.page = rankingState.targetUserId ? await findUserRankingPage({ sourceUserId: interaction.user.id, targetUserId: rankingState.targetUserId, guild: interaction.guild }) : 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
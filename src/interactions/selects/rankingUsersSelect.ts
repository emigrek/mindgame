import {Select} from "@/interfaces";
import {getErrorMessagePayload, getRankingMessagePayload} from "@/modules/messages";
import {rankingStore} from "@/stores/rankingStore";
import {UserSelectMenuInteraction} from "discord.js";
import {findUserRankingPage} from "@/modules/user-guild-statistics/userGuildStatistics";

export const rankingUsersSelect: Select = {
    customId: "rankingUsersSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.editReply(getErrorMessagePayload());
            return;
        }

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.userIds = interaction.values;
        rankingState.page = rankingState.targetUserId ? await findUserRankingPage({ sourceUserId: interaction.user.id, targetUserId: rankingState.targetUserId, guild: interaction.guild }) : 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as UserSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
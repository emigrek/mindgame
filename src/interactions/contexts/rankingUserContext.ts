import {ContextMenu, SortingRanges, SortingTypes} from "@/interfaces";
import {getErrorMessagePayload, getRankingMessagePayload} from "@/modules/messages";
import {ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction} from "discord.js";
import {rankingStore} from "@/stores/rankingStore";
import {findUserRankingPage} from "@/modules/user-guild-statistics/userGuildStatistics";

const rankingUserContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('rankingUser')
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.sorting = SortingTypes.EXP;
        rankingState.range = SortingRanges.TOTAL;
        rankingState.targetUserId = interaction.targetId;
        rankingState.page = await findUserRankingPage({ sourceUserId: interaction.user.id, targetUserId: interaction.targetId, guild: interaction.guild });
        rankingState.userIds = [];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as UserContextMenuCommandInteraction);
        await interaction.followUp(rankingMessagePayload);
    }
};

export default rankingUserContext;
import {ContextMenu, SortingRanges, SortingTypes} from "@/interfaces";
import {getErrorMessagePayload, getMessage, getRankingMessagePayload} from "@/modules/messages";
import {ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction} from "discord.js";
import {rankingStore} from "@/stores/rankingStore";
import {findUserRankingPage} from "@/modules/user-guild-statistics/userGuildStatistics";

const rankingMessageContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('rankingMessage')
        .setType(ApplicationCommandType.Message),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const message = await getMessage({
            messageId: (interaction as MessageContextMenuCommandInteraction).targetMessage.id,
        });
        const rankingState = rankingStore.get(interaction.user.id);
        const targetUserId = (message && message.targetUserId) ? message.targetUserId : undefined;

        rankingState.sorting = SortingTypes.EXP;
        rankingState.range = SortingRanges.TOTAL;
        rankingState.userIds = [];
        rankingState.targetUserId = targetUserId;
        if (targetUserId) {
            rankingState.page = await findUserRankingPage({ sourceUserId: interaction.user.id, targetUserId, guild: interaction.guild });
        }

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as MessageContextMenuCommandInteraction);
        await interaction.followUp(rankingMessagePayload);
    }
};

export default rankingMessageContext;
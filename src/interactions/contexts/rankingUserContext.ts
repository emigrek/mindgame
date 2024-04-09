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

        const isBot = await client.users.fetch(interaction.targetId)
            .then(user => user.bot)
            .catch(() => true);

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.sorting = SortingTypes.EXP;
        rankingState.range = SortingRanges.TOTAL;
        rankingState.targetUserId = !isBot ? interaction.targetId : undefined;
        rankingState.page = await findUserRankingPage({
            sourceUserId: interaction.user.id,
            targetUserId: !isBot ? interaction.targetId : interaction.user.id,
            guild: interaction.guild
        });
        rankingState.userIds = [];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as UserContextMenuCommandInteraction);
        await interaction.followUp(rankingMessagePayload);
    }
};

export default rankingUserContext;
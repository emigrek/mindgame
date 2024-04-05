import {ContextMenu} from "@/interfaces";
import {getRankingMessagePayload} from "@/modules/messages";
import {ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction} from "discord.js";
import {rankingStore} from "@/stores/rankingStore";

const rankingUserContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('ranking')
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const isBot = await client.users.fetch(interaction.targetId)
            .then(user => user.bot)
            .catch(() => true);

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.targetUserId = !isBot ? interaction.targetId : undefined;
        rankingState.userIds = [];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as UserContextMenuCommandInteraction);
        await interaction.followUp(rankingMessagePayload);
    }
};

export default rankingUserContext;
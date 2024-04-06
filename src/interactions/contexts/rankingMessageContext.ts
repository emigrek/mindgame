import {ContextMenu} from "@/interfaces";
import {getRankingMessagePayload} from "@/modules/messages";
import {ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction} from "discord.js";
import {rankingStore} from "@/stores/rankingStore";

const rankingMessageContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('ranking')
        .setType(ApplicationCommandType.Message),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.userIds = [];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as MessageContextMenuCommandInteraction);
        await interaction.followUp(rankingMessagePayload);
    }
};

export default rankingMessageContext;
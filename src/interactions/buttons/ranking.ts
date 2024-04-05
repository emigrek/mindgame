import {Button} from "@/interfaces";
import {getMessage, getRankingMessagePayload} from "@/modules/messages";
import {rankingStore} from "@/stores/rankingStore";

const ranking: Button = {
    customId: `ranking`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const sourceMessage = await getMessage({
            messageId: interaction.message.id,
        });
        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.targetUserId = (sourceMessage && sourceMessage.targetUserId) ? sourceMessage.targetUserId : undefined;
        rankingState.userIds = [];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.followUp(rankingMessagePayload);
    }
}

export default ranking;
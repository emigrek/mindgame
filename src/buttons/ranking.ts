import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";
import { rankingStore } from "../stores/rankingStore";

const ranking: Button = {
    customId: `ranking`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const rankingState = rankingStore.get(interaction.user.id);
        rankingState.userIds = [];

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.followUp(rankingMessagePayload);
    }
}

export default ranking;
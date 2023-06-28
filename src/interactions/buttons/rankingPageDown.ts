import { Button } from "@/interfaces";
import { getRankingMessagePayload } from "@/modules/messages";
import { rankingStore } from "@/stores/rankingStore";

const rankingPageDown: Button = {
    customId: `rankingPageDown`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.page = rankingState.page + 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingPageDown;
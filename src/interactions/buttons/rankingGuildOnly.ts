import { Button } from "@/interfaces";
import { getRankingMessagePayload } from "@/modules/messages";
import { rankingStore } from "@/stores/rankingStore";

const rankingGuildOnly: Button = {
    customId: `rankingGuildOnly`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.guildOnly = !rankingState.guildOnly;
        rankingState.page = 1;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingGuildOnly;
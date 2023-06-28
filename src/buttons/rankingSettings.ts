import { Button } from "../interfaces/Button";
import { getRankingSettingsModal } from "../modules/messages/modals";
import { rankingStore } from "../stores/rankingStore";

const rankingSettings: Button = {
    customId: `rankingSettings`,
    run: async (client, interaction) => {
        const rankingState = rankingStore.get(interaction.user.id);
        const modal = getRankingSettingsModal(rankingState.perPage);
        await interaction.showModal(modal);
    }
}

export default rankingSettings;
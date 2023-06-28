import { Button } from "../interfaces/Button";
import { getRankingSettingsModal } from "../modules/messages/modals";
import { rankingStore } from "../stores/rankingStore";

const rankingSettings: Button = {
    customId: `rankingSettings`,
    run: async (client, interaction) => {
        const { page, pagesCount, perPage } = rankingStore.get(interaction.user.id);
        const modal = getRankingSettingsModal(page, pagesCount, perPage);
        await interaction.showModal(modal);
    }
}

export default rankingSettings;
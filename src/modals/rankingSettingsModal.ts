import i18n from "../client/i18n";
import { Modal } from "../interfaces";
import { getRankingMessagePayload } from "../modules/messages";
import { WarningEmbed } from "../modules/messages/embeds";
import { rankingStore } from "../stores/rankingStore";

const rankingSettingsModal: Modal = {
    customId: "rankingSettingsModal",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);
        const currentPage = parseInt(interaction.fields.getTextInputValue("currentPageInput"));
        const perPage = parseInt(interaction.fields.getTextInputValue("perPageInput"));

        if(isNaN(currentPage) || currentPage < 1 || currentPage > rankingState.pagesCount) {
            await interaction.followUp({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__mf("ranking.settingsModal.currentPageInput.invalid", {
                            pagesCount: rankingState.pagesCount
                        }))
                ],
                ephemeral: true
            });
            return;
        }
        
        if(isNaN(perPage) || perPage < 1 || perPage > 25) {
            await interaction.followUp({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("ranking.settingsModal.perPageInput.invalid"))
                ],
                ephemeral: true
            });
            return;
        }

        rankingState.page = currentPage;
        rankingState.perPage = perPage;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingSettingsModal;
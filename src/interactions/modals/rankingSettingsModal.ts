import i18n from "@/client/i18n";
import {Modal} from "@/interfaces";
import {getErrorMessagePayload, getRankingMessagePayload} from "@/modules/messages";
import {WarningEmbed} from "@/modules/messages/embeds";
import {rankingStore} from "@/stores/rankingStore";
import {findUserRankingPage} from "@/modules/user-guild-statistics/userGuildStatistics";

const rankingSettingsModal: Modal = {
    customId: "rankingSettingsModal",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.editReply(getErrorMessagePayload());
            return;
        }

        const rankingState = rankingStore.get(interaction.user.id);
        const perPage = parseInt(interaction.fields.getTextInputValue("perPageInput"));
        const currentPage = parseInt(interaction.fields.getTextInputValue("currentPageInput"));

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

        const perPageChanged = perPage !== rankingState.perPage;
        rankingState.perPage = perPage;

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

        const pageChanged = currentPage !== rankingState.page;
        rankingState.page = !pageChanged && perPageChanged ? await findUserRankingPage({ sourceUserId: interaction.user.id, targetUserId: rankingState.targetUserId || interaction.user.id, guild: interaction.guild }) : currentPage;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingSettingsModal;
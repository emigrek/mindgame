import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import i18n from "@/client/i18n";

const getRankingSettingsModal = (page: number, pagesCount: number, perPage: number) => {
    const modal = new ModalBuilder()
        .setCustomId("rankingSettingsModal")
        .setTitle(i18n.__("ranking.settingsModal.title"));

    const currentPage = new TextInputBuilder()
        .setCustomId("currentPageInput")
        .setLabel(i18n.__("ranking.settingsModal.currentPageInput.label"))
        .setPlaceholder(
            i18n.__mf("ranking.settingsModal.currentPageInput.placeholder", {
                pagesCount
            })
        )
        .setValue(page.toString())
        .setStyle(TextInputStyle.Short);

    const perPageInput = new TextInputBuilder()
        .setCustomId("perPageInput")
        .setLabel(i18n.__("ranking.settingsModal.perPageInput.label"))
        .setPlaceholder(i18n.__("ranking.settingsModal.perPageInput.placeholder"))
        .setValue(perPage.toString())
        .setStyle(TextInputStyle.Short);


    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(currentPage),
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(perPageInput)
    );

    return modal;
};

export { getRankingSettingsModal };
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import i18n from "../../../client/i18n";

const getRankingSettingsModal = (perPage: number) => {
    const modal = new ModalBuilder()
        .setCustomId("rankingSettingsModal")
        .setTitle(i18n.__("ranking.settingsModal.title"));

    const perPageInput = new TextInputBuilder()
        .setCustomId("perPageInput")
        .setLabel(i18n.__("ranking.settingsModal.perPageInput.label"))
        .setPlaceholder(i18n.__("ranking.settingsModal.perPageInput.placeholder"))
        .setValue(perPage.toString())
        .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder<TextInputBuilder>()
        .addComponents(perPageInput);

    modal.addComponents(row);

    return modal;
};

export { getRankingSettingsModal };
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

const getColorPickerModal = (color: string) => {
    const modal = new ModalBuilder()
        .setCustomId("colorPickerModal")
        .setTitle(i18n.__("color.pickerModal.title"));

    const colorInput = new TextInputBuilder()
        .setCustomId("colorInput")
        .setLabel(i18n.__("color.pickerModal.colorInput.label"))
        .setPlaceholder(i18n.__("color.pickerModal.colorInput.placeholder"))
        .setValue(color)
        .setStyle(TextInputStyle.Short);
    
    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(colorInput)
    );

    return modal;
};

const getSelectOptionsModal = () => {
    const modal = new ModalBuilder()
        .setCustomId("selectOptionsModal")
        .setTitle(i18n.__("select.selectOptionsModal.title"));
    
    const optionsInput = new TextInputBuilder()
        .setCustomId("optionsInput")
        .setLabel(i18n.__("select.selectOptionsModal.optionsInput.label"))
        .setPlaceholder(i18n.__("select.selectOptionsModal.optionsInput.placeholder"))
        .setStyle(TextInputStyle.Paragraph);
    
    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>()
            .addComponents(optionsInput)
    );

    return modal;
}

export { getRankingSettingsModal, getColorPickerModal, getSelectOptionsModal };
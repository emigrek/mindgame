import { Command } from "@/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import i18n from "@/client/i18n";
import { getSelectOptionsModal } from "@/modules/messages/modals";
import { selectOptionsStore } from "@/stores/selectOptionsStore";

export const select: Command = {
    data: new SlashCommandBuilder()
        .setName("select")
        .setDescription(i18n.__("commandLocalizations.select.description")),
    execute: async (client, interaction) => {
        selectOptionsStore.init(interaction.user.id);

        const selectModal = getSelectOptionsModal();
        await interaction.showModal(selectModal);
    }
}
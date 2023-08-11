import { Command } from "@/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import i18n from "@/client/i18n";
import { getSelectOptionsModal } from "@/modules/messages/modals";

export const select: Command = {
    data: new SlashCommandBuilder()
        .setName("select")
        .setDescription(i18n.__("commandLocalizations.select.description")),
    execute: async (client, interaction) => {
        const selectModal = getSelectOptionsModal();
        await interaction.showModal(selectModal);
    }
}
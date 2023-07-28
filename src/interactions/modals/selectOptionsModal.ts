import i18n from "@/client/i18n";
import { Modal } from "@/interfaces";
import { getSelectMessagePayload } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { selectOptionsStore } from "@/stores/selectOptionsStore";

const selectOptionsModal: Modal = {
    customId: "selectOptionsModal",
    run: async (client, interaction) => {
        const selectOptionsState = selectOptionsStore.get(interaction.user.id);
        const options = interaction.fields.getTextInputValue("optionsInput")
            .split("\n")
            .filter(option => option.trim() !== "");

        if (options.length < 2) {
            await interaction.reply({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("select.selectOptionsModal.optionsInput.invalid"))
                ],
                ephemeral: true
            });
            return;
        }

        selectOptionsState.options = options;

        const selectMessagePayload = await getSelectMessagePayload(client, interaction, false);
        const reply = await interaction.reply(selectMessagePayload);
        
        setTimeout(async () => {
            const selectMessagePayload = await getSelectMessagePayload(client, interaction, true);
            await reply.edit(selectMessagePayload);
        }, 2000);
    }
}

export default selectOptionsModal;
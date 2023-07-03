import { Modal } from "@/interfaces";
import { getColorMessagePayload } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { checkColorLuminance } from "@/modules/roles";
import { colorStore } from "@/stores/colorStore";
import chroma from "chroma-js";
import i18n from "@/client/i18n";

const colorPickerModal: Modal = {
    customId: "colorPickerModal",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const colorState = colorStore.get(interaction.user.id);
        const desiredColor = interaction.fields.getTextInputValue("colorInput");

        if(!chroma.valid(desiredColor)) {
            await interaction.followUp({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("color.pickerModal.colorInput.invalid"))
                ],
                ephemeral: true
            });
            return;
        }

        if(!checkColorLuminance(chroma(desiredColor).hex(), 0.1)) {
            await interaction.followUp({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("color.tooDark"))
                ],
                ephemeral: true
            });
            return;
        }


        colorState.color = chroma(desiredColor).hex();

        const rankingMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default colorPickerModal;
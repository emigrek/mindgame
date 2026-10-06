import { MessageFlags } from "discord.js";
import i18n from "@/client/i18n";
import { Modal } from "@/interfaces";
import { getSelectMessagePayload } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { selectOptionsStore } from "@/stores/selectOptionsStore";
import { getRandomNumber } from "@/utils/random";

const selectOptionsModal: Modal = {
    customId: "selectOptionsModal",
    run: async (client, interaction) => {
        const selectOptionsState = selectOptionsStore.get(interaction.user.id);
        // Each option becomes an embed field: at most 25 of them, and short enough for a field name
        const options = interaction.fields.getTextInputValue("optionsInput")
            .split("\n")
            .map(option => option.trim().slice(0, 100))
            .filter(option => option !== "");

        if (options.length < 2 || options.length > 25) {
            await interaction.reply({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__(options.length > 25
                            ? "select.selectOptionsModal.optionsInput.tooMany"
                            : "select.selectOptionsModal.optionsInput.invalid"))
                ],
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        selectOptionsState.options = options;

        const selectMessagePayload = await getSelectMessagePayload(client, interaction, false);
        const reply = await interaction.reply(selectMessagePayload);
        
        setTimeout(async () => {
            const selectMessagePayload = await getSelectMessagePayload(client, interaction, true);
            // The message can be deleted before the reveal
            await reply.edit(selectMessagePayload)
                .catch(e => console.log(`Error while revealing select result: ${e}`));
        }, getRandomNumber(2000, 5000));
    }
}

export default selectOptionsModal;
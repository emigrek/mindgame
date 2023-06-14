import { Select } from "../interfaces/Select";
import { setLocale, withGuildLocale } from "../modules/locale";
import { getConfigMessagePayload, getErrorMessagePayload } from "../modules/messages";

export const localeSelect: Select = {
    customId: "localeSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const selected = interaction.values[0];

        client.i18n.setLocale(selected);
        await setLocale(interaction.guild!, selected);
        await withGuildLocale(client, interaction.guild!);

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        if(!configMessage) {
            const errorMessage = getErrorMessagePayload(client);
            await interaction.editReply(errorMessage);
            return;
        }

        await interaction.editReply(configMessage);
    }
}
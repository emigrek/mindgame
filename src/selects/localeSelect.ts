import { Select } from "../interfaces/Select";
import { setLocale, withGuildLocale } from "../modules/locale";
import { getConfigMessagePayload } from "../modules/messages";

export const localeSelect: Select = {
    customId: "localeSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const selected = interaction.values[0];

        client.i18n.setLocale(selected);
        await setLocale(interaction.guild!, selected);
        await withGuildLocale(client, interaction.guild!);

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.editReply(configMessage);
    }
}
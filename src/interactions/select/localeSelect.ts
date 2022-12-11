import { PermissionFlagsBits, StringSelectMenuInteraction } from "discord.js";
import { Interaction } from "../../interfaces";
import { setLocale } from "../../modules/locale";
import { getConfigMessagePayload } from "../../modules/messages";

export const localeSelect: Interaction = {
    customId: "localeSelect",
    permissions: [PermissionFlagsBits.Administrator],
    run: async (client, interaction) => {
        if(!(interaction instanceof StringSelectMenuInteraction)) return;

        const selected = interaction.values[0];
        client.i18n.setLocale(selected);

        await setLocale(interaction.guild, selected);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.update(configMessage!);
    }
}
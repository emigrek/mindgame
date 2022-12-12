import { PermissionFlagsBits, StringSelectMenuInteraction } from "discord.js";
import { withGuildLocale } from "../modules/locale";
import { setDefaultChannelId } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";

export const defaultChannelSelect: Select = {
    customId: "defaultChannelSelect",
    permissions: [PermissionFlagsBits.Administrator],
    run: async (client, interaction) => {
        const guild = interaction.guild;
        const selected = interaction.values[0];
        
        await setDefaultChannelId(guild!, selected);

        withGuildLocale(client, guild!);
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.update(configMessage!);
    }
}
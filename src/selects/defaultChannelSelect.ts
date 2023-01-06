import { PermissionFlagsBits, StringSelectMenuInteraction } from "discord.js";
import { withGuildLocale } from "../modules/locale";
import { setDefaultChannelId } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";

export const defaultChannelSelect: Select = {
    customId: "defaultChannelSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const guild = interaction.guild;
        const selected = interaction.values[0];
        
        await setDefaultChannelId(guild!, selected);

        await withGuildLocale(client, guild!);
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.editReply({
            files: configMessage!.files,
            components: configMessage!.components
        });
    }
}
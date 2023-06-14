import { withGuildLocale } from "../modules/locale";
import { setDefaultChannelId } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";

export const defaultChannelSelect: Select = {
    customId: "defaultChannelSelect",
    run: async (client, interaction) => {
        await withGuildLocale(client, interaction.guild!);
        await interaction.deferUpdate();
        const selected = interaction.values[0];
        
        await setDefaultChannelId(interaction.guild!, selected);

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.editReply(configMessage);
    }
}
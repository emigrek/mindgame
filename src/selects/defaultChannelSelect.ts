import { setDefaultChannelId } from "../modules/guild";
import { getConfigMessagePayload, getErrorMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";

export const defaultChannelSelect: Select = {
    customId: "defaultChannelSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(client), ephemeral: true });
            return;
        }

        const selected = interaction.values[0];
        await setDefaultChannelId(interaction.guild, selected);

        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}
import { setDefaultChannelId } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";

export const defaultChannelSelect: Select = {
    customId: "defaultChannelSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }
        
        const selected = interaction.values[0];
        await setDefaultChannelId(interaction.guild, selected);

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.editReply(configMessage);
    }
}
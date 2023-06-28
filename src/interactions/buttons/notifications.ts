import { Button } from "@/interfaces";
import { setNotifications } from "@/modules/guild";
import { getConfigMessagePayload, getErrorMessagePayload } from "@/modules/messages";

const notifications: Button = {
    customId: `notifications`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if(!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        await setNotifications(interaction.guild);
        
        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}

export default notifications;
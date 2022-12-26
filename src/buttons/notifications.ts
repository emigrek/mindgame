import { Button } from "../interfaces/Button";
import { setNotifications } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";

const notifications: Button = {
    customId: `notifications`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        await setNotifications(interaction.guild!);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.editReply({
            components: configMessage!.components
        });
    }
}

export default notifications;
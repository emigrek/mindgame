import { Interaction } from "../../interfaces/Interaction"
import { ButtonInteraction, PermissionFlagsBits } from "discord.js";
import { setNotifications } from "../../modules/guild";
import { getConfigMessagePayload } from "../../modules/messages";

const notifications: Interaction = {
    customId: `notifications`,
    permissions: [PermissionFlagsBits.Administrator],
    run: async (client, interaction) => {
        if(!(interaction instanceof ButtonInteraction)) return;
        await setNotifications(interaction.guild!);

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.update(configMessage!);
    }
}

export default notifications;
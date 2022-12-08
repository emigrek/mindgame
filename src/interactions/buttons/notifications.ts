import { Interaction } from "../../interfaces/Interaction"
import { ButtonInteraction } from "discord.js";
import { setNotifications } from "../../modules/guild";
import { getConfigMessagePayload } from "../../modules/messages";

const notifications: Interaction = {
    customId: `notifications`,
    run: async (client, interaction) => {
        if(!(interaction instanceof ButtonInteraction)) return;

        if(interaction.guild?.ownerId != interaction.user.id) {
            interaction.reply({ content: client.i18n.__("utils.noPermissions"), ephemeral: true });
            return;
        }
        
        await setNotifications(interaction.guild!);

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.update(configMessage!);
    }
}

export default notifications;
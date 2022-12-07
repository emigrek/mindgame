import { Interaction } from "../../interfaces/Interaction"
import { ButtonInteraction } from "discord.js";
import { sendConfigMessage } from "../../modules/messages";

const en: Interaction = {
    customId: `en`,
    run: async (client, interaction) => {
        if(!(interaction instanceof ButtonInteraction)) return;
        
        if(interaction.guild?.ownerId != interaction.user.id) {
            interaction.reply({ content: client.i18n.__("utils.noPermissions"), ephemeral: true });
            return;
        }

        interaction.message.delete();
        
        client.i18n.setLocale(en.customId.toLowerCase());
        sendConfigMessage(client, interaction.guild!);
    }
}

export default en;
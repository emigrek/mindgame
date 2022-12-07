import { Interaction } from "../../interfaces/Interaction"
import { ButtonInteraction } from "discord.js";
import { sendConfigMessage } from "../../modules/messages";

const pl: Interaction = {
    customId: `pl`,
    run: async (client, interaction) => {
        if(!(interaction instanceof ButtonInteraction)) return;
        
        if(interaction.guild?.ownerId != interaction.user.id) {
            interaction.reply({ content: client.i18n.__("utils.noPermissions"), ephemeral: true });
            return;
        }
        interaction.message.delete();

        client.i18n.setLocale(pl.customId.toLowerCase());
        sendConfigMessage(client, interaction.guild!);
    }
}

export default pl;
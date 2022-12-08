import { Interaction } from "../../interfaces/Interaction"
import { ButtonInteraction } from "discord.js";

const remove: Interaction = {
    customId: `remove`,
    run: async (client, interaction) => {
        if(!(interaction instanceof ButtonInteraction)) return;
        
        if(interaction.guild?.ownerId != interaction.user.id) {
            interaction.reply({ content: client.i18n.__("utils.noPermissions"), ephemeral: true });
            return;
        }

        interaction.message.delete();
    }
}

export default remove;
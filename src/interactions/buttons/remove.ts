import { Interaction } from "../../interfaces/Interaction"
import { ButtonInteraction, PermissionFlagsBits } from "discord.js";

const remove: Interaction = {
    customId: `remove`,
    permissions: [PermissionFlagsBits.Administrator],
    run: async (client, interaction) => {
        if(!(interaction instanceof ButtonInteraction)) return;
        interaction.message.delete();
    }
}

export default remove;
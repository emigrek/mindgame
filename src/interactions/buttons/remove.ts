import { Interaction } from "../../interfaces/Interaction"
import { ButtonInteraction } from "discord.js";

const remove: Interaction = {
    customId: `remove`,
    run: async (client, interaction) => {
        if(!(interaction instanceof ButtonInteraction)) return;
        interaction.message.delete();
    }
}

export default remove;
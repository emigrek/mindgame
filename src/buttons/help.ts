import { Button } from "../interfaces";
import { getHelpMessagePayload } from "../modules/messages";

const help: Button = {
    customId: `help`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const helpMesagePayload = await getHelpMessagePayload(client);
        await interaction.followUp(helpMesagePayload);
    }
}

export default help;
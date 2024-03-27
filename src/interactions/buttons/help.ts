import {Button} from "@/interfaces";
import {getHelpMessagePayload} from "@/modules/messages";

const help: Button = {
    customId: `help`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const helpMessagePayload = await getHelpMessagePayload(client);
        await interaction.followUp(helpMessagePayload);
    }
}

export default help;
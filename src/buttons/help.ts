import { Button } from "../interfaces";
import { withGuildLocale } from "../modules/locale";
import { getHelpMessagePayload } from "../modules/messages";

const help: Button = {
    customId: `help`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        if(interaction.guild) {
            await withGuildLocale(client, interaction.guild!);
        }

        const helpMesagePayload = await getHelpMessagePayload(client);
        await interaction.followUp(helpMesagePayload);
    }
}

export default help;
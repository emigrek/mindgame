import { Button } from "../interfaces";
import { getGuild } from "../modules/guild";
import { withGuildLocale } from "../modules/locale";
import { getHelpMessagePayload, getStatisticsMessagePayload, getUserMessagePayload } from "../modules/messages";

const help: Button = {
    customId: `help`,
    run: async (client, interaction) => {
        if(interaction.guild) {
            await withGuildLocale(client, interaction.guild!);
        }

        await interaction.deferReply({ ephemeral: true });
        const helpMesagePayload = await getHelpMessagePayload(client);
        await interaction.followUp({ ...helpMesagePayload, ephemeral: true });
    }
}

export default help;
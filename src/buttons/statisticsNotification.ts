import { Button } from "../interfaces/Button";
import { setStatisticsNotification } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";

const statisticsNotification: Button = {
    customId: `statisticsNotification`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        await setStatisticsNotification(interaction.guild!);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.editReply({
            components: configMessage!.components
        });
    }
}

export default statisticsNotification;
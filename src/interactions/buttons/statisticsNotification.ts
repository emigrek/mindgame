import { Button } from "@/interfaces";
import { setStatisticsNotification } from "@/modules/guild";
import { getConfigMessagePayload, getErrorMessagePayload } from "@/modules/messages";

const statisticsNotification: Button = {
    customId: `statisticsNotification`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        
        if(!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        await setStatisticsNotification(interaction.guild);
        
        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}

export default statisticsNotification;
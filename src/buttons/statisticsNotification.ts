import { Button } from "../interfaces/Button";
import { setStatisticsNotification } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";

const statisticsNotification: Button = {
    customId: `statisticsNotification`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }

        await setStatisticsNotification(interaction.guild);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild);
        await interaction.editReply(configMessage);
    }
}

export default statisticsNotification;
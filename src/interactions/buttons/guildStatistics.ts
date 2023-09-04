import { Button } from "@/interfaces";
import { getErrorMessagePayload, getStatisticsMessagePayload } from "@/modules/messages";

const guildStatistics: Button = {
    customId: `guildStatistics`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if(!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const guildStatisticsPayload = await getStatisticsMessagePayload(client, interaction.guild);
        await interaction.followUp(guildStatisticsPayload);
    }
}

export default guildStatistics;
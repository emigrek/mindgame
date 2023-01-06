import { Button } from "../interfaces";
import { getGuild } from "../modules/guild";
import { withGuildLocale } from "../modules/locale";
import { getStatisticsMessagePayload, getUserMessagePayload } from "../modules/messages";

const guildStatistics: Button = {
    customId: `guildStatistics`,
    run: async (client, interaction) => {
        await withGuildLocale(client, interaction.guild!);

        await interaction.deferReply({ ephemeral: true });
        const sourceGuild = await getGuild(interaction.guild!);
        if(!sourceGuild) return;

        const guildStatisticsPayload = await getStatisticsMessagePayload(client, interaction.guild!);
        await interaction.followUp({ ...guildStatisticsPayload, ephemeral: true });
    }
}

export default guildStatistics;
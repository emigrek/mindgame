import { Button } from "../interfaces";
import { getGuild } from "../modules/guild";
import { withGuildLocale } from "../modules/locale";
import { getStatisticsMessagePayload } from "../modules/messages";

const guildStatistics: Button = {
    customId: `guildStatistics`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await withGuildLocale(client, interaction.guild!);

        const sourceGuild = await getGuild(interaction.guild!);
        if(!sourceGuild) return;

        const guildStatisticsPayload = await getStatisticsMessagePayload(client, interaction.guild!);
        await interaction.followUp(guildStatisticsPayload);
    }
}

export default guildStatistics;
import { Button } from "../interfaces";
import { withGuildLocale } from "../modules/locale";
import { getCommitsMessagePayload } from "../modules/messages";
import { updateUserStatistics } from "../modules/user";

const commits: Button = {
    customId: `commits`,
    run: async (client, interaction) => {
        if(interaction.guild) {
            await withGuildLocale(client, interaction.guild!);
        }    
    
        await interaction.deferReply({ ephemeral: true });
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const commitsMessagePayload = await getCommitsMessagePayload(client);
        await interaction.followUp({ ...commitsMessagePayload, ephemeral: true });
    }
}

export default commits;
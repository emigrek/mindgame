import { Button } from "../interfaces";
import { getCommitsMessagePayload } from "../modules/messages";
import { updateUserStatistics } from "../modules/user";

const commits: Button = {
    customId: `commits`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const commitsMessagePayload = await getCommitsMessagePayload(client);
        await interaction.followUp(commitsMessagePayload);
    }
}

export default commits;
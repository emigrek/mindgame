import { Button } from "../interfaces";
import { getCommitsMessagePayload } from "../modules/messages";

const commits: Button = {
    customId: `commits`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const commitsMessagePayload = await getCommitsMessagePayload(client);
        await interaction.followUp(commitsMessagePayload);
    }
}

export default commits;
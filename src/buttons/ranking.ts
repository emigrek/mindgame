import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";
import { findUserRankingPage, updateUserStatistics } from "../modules/user";

const defaultType = "exp";

const ranking: Button = {
    customId: `ranking`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const page = await findUserRankingPage(client, defaultType, interaction.user!);
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, defaultType, page);
        await interaction.followUp({ ...rankingMessagePayload, ephemeral: true });
    }
}

export default ranking;
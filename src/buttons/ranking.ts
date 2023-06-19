import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";
import { findUserRankingPage, updateUserStatistics } from "../modules/user";
import { getSortingByType } from "../modules/user/sortings";

const defaultType = "exp";

const ranking: Button = {
    customId: `ranking`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const sorting = getSortingByType(defaultType);
        const page = await findUserRankingPage(client, sorting, interaction.user);
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, sorting, page);
        await interaction.followUp(rankingMessagePayload);
    }
}

export default ranking;
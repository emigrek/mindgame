import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";

const rankingPageUp: Button = {
    customId: `rankingPageUp`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const messagePage = parseInt(interaction.message.embeds[0].footer!.text!.split(" ")[1]) - 1;
        const messageType = interaction.message.embeds[0].title!.split(" ").slice(2).join(" ").toLowerCase();
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, messageType, messagePage);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingPageUp;
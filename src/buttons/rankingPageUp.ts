import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";

const rankingPageUp: Button = {
    customId: `rankingPageUp`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const messagePage = parseInt(interaction.message.embeds[0].footer!.text!.split(" ")[1]) - 1;
        const messageType = interaction.message.embeds[0].title!.split(" ").slice(3).join(" ").toLowerCase();
        const messageRankingSope = interaction.message.embeds[0].title!.split(" ")[1].toLowerCase() == "guild" ? true : false;
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, messageType, messagePage, messageRankingSope ? interaction.guild! : undefined);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingPageUp;
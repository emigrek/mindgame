import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";
import { getSortingByType } from "../modules/user/sortings";

const rankingPageUp: Button = {
    customId: `rankingPageUp`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const messagePage = parseInt(interaction.message.embeds[0].footer!.text!.split(" ")[1]) - 1;
        const messageType = interaction.message.embeds[0].title!.split(" ").slice(3).join(" ").toLowerCase();
        const sorting = await getSortingByType(messageType);
        const messageRankingSope = interaction.message.embeds[0].title!.split(" ")[1].toLowerCase() == "guild" ? true : false;
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, sorting, messagePage, messageRankingSope ? interaction.guild! : undefined);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingPageUp;
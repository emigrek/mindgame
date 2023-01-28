import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";
import { findUserRankingPage } from "../modules/user";

const rankingGuildOnly: Button = {
    customId: `rankingGuildOnly`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const messageType = interaction.message.embeds[0].title!.split(" ").slice(3).join(" ").toLowerCase();
        const messageRankingSope = interaction.message.embeds[0].title!.split(" ")[1].toLowerCase() == "guild" ? true : false;
        const page = await findUserRankingPage(client, messageType, interaction.user!, !messageRankingSope ? interaction.guild! : undefined);
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, messageType, page, !messageRankingSope ? interaction.guild! : undefined);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingGuildOnly;
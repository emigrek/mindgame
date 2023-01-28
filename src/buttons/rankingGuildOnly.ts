import { Button } from "../interfaces/Button";
import { getRankingMessagePayload } from "../modules/messages";
import { findUserRankingPage, updateUserStatistics } from "../modules/user";

const rankingGuildOnly: Button = {
    customId: `rankingGuildOnly`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const messagePage = parseInt(interaction.message.embeds[0].footer!.text!.split(" ")[1]);
        const messageType = interaction.message.embeds[0].title!.split(" ").slice(3).join(" ").toLowerCase();
        const messageRankingSope = interaction.message.embeds[0].title!.split(" ")[1].toLowerCase() == "guild" ? true : false;
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction, messageType, messagePage, !messageRankingSope ? interaction.guild! : undefined);
        await interaction.editReply(rankingMessagePayload);
    }
}

export default rankingGuildOnly;
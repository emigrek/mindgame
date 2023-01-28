import { getRankingMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";
import { findUserRankingPage } from "../modules/user";
import { StringSelectMenuInteraction } from "discord.js";

export const rankingSortSelect: Select = {
    customId: "rankingSortSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const selected = interaction.values[0];
        const messageRankingSope = interaction.message.embeds[0].title!.split(" ")[1].toLowerCase() == "guild" ? true : false;
        const page: number = await findUserRankingPage(client, selected, interaction.user!, messageRankingSope ? interaction.guild! : undefined);
        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction, selected, page, messageRankingSope ? interaction.guild! : undefined);
        await interaction.editReply(rankingMessagePayload);
    }
}
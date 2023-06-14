import { getErrorMessagePayload, getRankingMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";
import { findUserRankingPage } from "../modules/user";
import { StringSelectMenuInteraction } from "discord.js";
import { getSortingByType } from "../modules/user/sortings";

export const rankingSortSelect: Select = {
    customId: "rankingSortSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const selected = interaction.values[0];
        const messageRankingSope = interaction.message.embeds[0].title!.split(" ")[1].toLowerCase() == "guild" ? true : false;
        const sorting = await getSortingByType(selected);
        const page: number = await findUserRankingPage(client, sorting, interaction.user!, messageRankingSope ? interaction.guild! : undefined);

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as StringSelectMenuInteraction, sorting, page, messageRankingSope ? interaction.guild! : undefined);
        await interaction.editReply(rankingMessagePayload);
    }
}
import { getRankingMessagePayload } from "../modules/messages";
import { Select } from "../interfaces/Select";
import { UserSelectMenuInteraction } from "discord.js";
import { rankingStore } from "../stores/rankingStore";

export const rankingUsersSelect: Select = {
    customId: "rankingUsersSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const rankingState = rankingStore.get(interaction.user.id);

        rankingState.userIds = interaction.values;
        rankingState.guildOnly = false;

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as UserSelectMenuInteraction);
        await interaction.editReply(rankingMessagePayload);
    }
}
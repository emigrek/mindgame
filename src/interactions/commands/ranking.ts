import {Command} from "@/interfaces";
import {SlashCommandBuilder} from "@discordjs/builders";
import {getErrorMessagePayload, getRankingMessagePayload} from "@/modules/messages";
import i18n from "@/client/i18n";
import {openRanking} from "@/modules/user-guild-statistics/userGuildStatistics";

export const ranking: Command = {
    data: new SlashCommandBuilder()
        .setName("ranking")
        .setDescription(i18n.__("commandLocalizations.ranking.description")),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        await openRanking({ sourceUserId: interaction.user.id, guild: interaction.guild });

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.followUp(rankingMessagePayload);
    }
}
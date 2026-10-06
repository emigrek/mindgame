import { MessageFlags } from "discord.js";
import {Button} from "@/interfaces";
import {getErrorMessagePayload, getMessage, getRankingMessagePayload} from "@/modules/messages";
import {openRanking} from "@/modules/user-guild-statistics/userGuildStatistics";

const ranking: Button = {
    customId: `ranking`,
    run: async (client, interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral });
            return;
        }

        const message = await getMessage({
            messageId: interaction.message.id,
        });
        // Quick buttons under a tracked notification open the ranking on its member
        await openRanking({ sourceUserId: interaction.user.id, targetUserId: message?.targetUserId || undefined, guild: interaction.guild });

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction);
        await interaction.followUp(rankingMessagePayload);
    }
}

export default ranking;
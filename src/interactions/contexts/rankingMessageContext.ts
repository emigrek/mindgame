import {ContextMenu} from "@/interfaces";
import {getErrorMessagePayload, getMessage, getRankingMessagePayload} from "@/modules/messages";
import {ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction} from "discord.js";
import {openRanking} from "@/modules/user-guild-statistics/userGuildStatistics";

const rankingMessageContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('rankingMessage')
        .setType(ApplicationCommandType.Message),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const message = await getMessage({
            messageId: (interaction as MessageContextMenuCommandInteraction).targetMessage.id,
        });
        await openRanking({ sourceUserId: interaction.user.id, targetUserId: message?.targetUserId || undefined, guild: interaction.guild });

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as MessageContextMenuCommandInteraction);
        await interaction.followUp(rankingMessagePayload);
    }
};

export default rankingMessageContext;
import {ContextMenu} from "@/interfaces";
import {getErrorMessagePayload, getRankingMessagePayload} from "@/modules/messages";
import {ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction} from "discord.js";
import {openRanking} from "@/modules/user-guild-statistics/userGuildStatistics";

const rankingUserContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('rankingUser')
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const isBot = await client.users.fetch(interaction.targetId)
            .then(user => user.bot)
            .catch(() => true);

        await openRanking({ sourceUserId: interaction.user.id, targetUserId: !isBot ? interaction.targetId : undefined, guild: interaction.guild });

        const rankingMessagePayload = await getRankingMessagePayload(client, interaction as UserContextMenuCommandInteraction);
        await interaction.followUp(rankingMessagePayload);
    }
};

export default rankingUserContext;
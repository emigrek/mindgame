import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu } from "../interfaces";
import { getStatisticsMessagePayload, getUserMessagePayload, useHtmlFile, useImageHex } from "../modules/messages";
import { getGuild } from "../modules/guild";

const guildStatisticsContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show guild week statistics`)
        .setType(ApplicationCommandType.Message),
    run: async (client, interaction) => {
        if(!interaction.guild) {
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        const sourceGuild = await getGuild(interaction.guild!);
        if(!sourceGuild) return;

        const guildStatisticsPayload = await getStatisticsMessagePayload(client, interaction.guild!);
        await interaction.followUp({ ...guildStatisticsPayload, ephemeral: true });
    }
};

export default guildStatisticsContext;
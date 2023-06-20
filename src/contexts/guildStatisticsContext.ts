import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { ContextMenu } from "../interfaces";
import { getStatisticsMessagePayload } from "../modules/messages";

const guildStatisticsContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show guild week statistics`)
        .setType(ApplicationCommandType.Message),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }
        
        const guildStatisticsPayload = await getStatisticsMessagePayload(client, interaction.guild!);
        await interaction.followUp(guildStatisticsPayload);
    }
};

export default guildStatisticsContext;
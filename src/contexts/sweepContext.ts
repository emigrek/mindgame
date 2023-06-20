import { ApplicationCommandType, ContextMenuCommandBuilder, TextChannel } from "discord.js";
import { ContextMenu } from "../interfaces";
import { sweepTextChannel } from "../modules/messages";

const sweepContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Sweep this channel`)
        .setType(ApplicationCommandType.Message),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }

        const sweeped = await sweepTextChannel(client, interaction.channel as TextChannel);
        await interaction.followUp({
            content: client.i18n.__mf("sweeper.sweeped", { count: sweeped }),
            ephemeral: true
        });
    }
};

export default sweepContext;
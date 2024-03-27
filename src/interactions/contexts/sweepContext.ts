import {ApplicationCommandType, ContextMenuCommandBuilder, TextChannel} from "discord.js";
import {ContextMenu} from "@/interfaces";
import {sweepTextChannel} from "@/modules/messages";
import {InformationEmbed} from "@/modules/messages/embeds";
import i18n from "@/client/i18n";

const sweepContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('sweep')
        .setType(ApplicationCommandType.Message)
        .setDMPermission(false),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const swept = await sweepTextChannel(client, interaction.channel as TextChannel);
        await interaction.followUp({
            embeds: [
                InformationEmbed()
                    .setDescription(i18n.__mf("sweeper.swept", { count: swept }))
            ]
        });
    }
};

export default sweepContext;
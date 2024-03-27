import {TextChannel} from "discord.js";
import {Button} from "@/interfaces";
import {getErrorMessagePayload, sweepTextChannel} from "@/modules/messages";
import {InformationEmbed} from "@/modules/messages/embeds";
import i18n from "@/client/i18n";

const sweep: Button = {
    customId: `sweep`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if(!interaction.guild) {
            await interaction.followUp(getErrorMessagePayload());
            return;
        }

        const swept = await sweepTextChannel(client, interaction.channel as TextChannel);

        await interaction.followUp({
            embeds: [
                InformationEmbed()
                    .setDescription(i18n.__mf("sweeper.swept", { count: swept }))
            ]
        });
    }
}

export default sweep;
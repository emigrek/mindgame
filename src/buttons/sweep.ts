import { TextChannel } from "discord.js";
import { Button } from "../interfaces";
import { withGuildLocale } from "../modules/locale";
import { sweepTextChannel } from "../modules/messages";

const sweep: Button = {
    customId: `sweep`,
    run: async (client, interaction) => {
        await withGuildLocale(client, interaction.guild!);
        
        await interaction.deferReply({ ephemeral: true });

        const sweeped = await sweepTextChannel(client, interaction.guild!, interaction.channel as TextChannel);

        await interaction.followUp({
            content: client.i18n.__mf("sweeper.sweeped", { count: sweeped }),
            ephemeral: true
        });
    }
}

export default sweep;
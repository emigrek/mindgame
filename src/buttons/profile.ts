import { ButtonInteraction, UserContextMenuCommandInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { withGuildLocale } from "../modules/locale";
import { getUserMessagePayload } from "../modules/messages";

const profile: Button = {
    customId: `profile`,
    run: async (client, interaction) => {
        await withGuildLocale(client, interaction.guild!);

        await interaction.deferReply({ ephemeral: true });
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction);
        await interaction.followUp({ ...profileMessagePayload, ephemeral: true });
    }
}

export default profile;
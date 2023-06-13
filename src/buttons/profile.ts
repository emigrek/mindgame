import { ButtonInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { withGuildLocale } from "../modules/locale";
import { getMessage, getUserMessagePayload } from "../modules/messages";

const profile: Button = {
    customId: `profile`,
    run: async (client, interaction) => {
        await withGuildLocale(client, interaction.guild!);
        await interaction.deferReply({ ephemeral: true });

        const sourceMessage = await getMessage(interaction.message.id);
        const renderedUser = sourceMessage ? sourceMessage.targetUserId : interaction.user.id;
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction, renderedUser!);
        await interaction.followUp({ ...profileMessagePayload, ephemeral: true });
    }
}

export default profile;
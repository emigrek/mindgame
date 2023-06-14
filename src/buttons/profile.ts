import { ButtonInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { withGuildLocale } from "../modules/locale";
import { getMessage, getUserMessagePayload } from "../modules/messages";

const profile: Button = {
    customId: `profile`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await withGuildLocale(client, interaction.guild!);

        const sourceMessage = await getMessage(interaction.message.id);
        const renderedUser = sourceMessage ? sourceMessage.targetUserId : interaction.user.id;
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction, renderedUser!);
        await interaction.followUp(profileMessagePayload);
    }
}

export default profile;
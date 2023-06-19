import { ButtonInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { getMessage, getUserMessagePayload } from "../modules/messages";

const profile: Button = {
    customId: `profile`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const sourceMessage = await getMessage(interaction.message.id);
        const renderedUser = sourceMessage ? sourceMessage.targetUserId : interaction.user.id;
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction, renderedUser!);
        await interaction.followUp(profileMessagePayload);
    }
}

export default profile;
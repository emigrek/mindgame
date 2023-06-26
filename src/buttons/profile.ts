import { ButtonInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { getMessage, getUserMessagePayload } from "../modules/messages";
import { profileStore } from "../stores/profileStore";

const profile: Button = {
    customId: `profile`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const sourceMessage = await getMessage(interaction.message.id);
        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = (sourceMessage && sourceMessage.targetUserId) ? sourceMessage.targetUserId : interaction.user.id;
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction);
        await interaction.followUp(profileMessagePayload);
    }
}

export default profile;
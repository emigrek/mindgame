import { Button, ProfilePages } from "@/interfaces";
import { getMessage, getProfileMessagePayload } from "@/modules/messages";
import { profileStore } from "@/stores/profileStore";
import { ButtonInteraction } from "discord.js";

const profile: Button = {
    customId: `profile`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const sourceMessage = await getMessage({
            messageId: interaction.message.id,
        });
        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = (sourceMessage && sourceMessage.targetUserId) ? sourceMessage.targetUserId : interaction.user.id;
        profileState.page = ProfilePages.About;
        
        const profileMessagePayload = await getProfileMessagePayload(client, interaction as ButtonInteraction);
        await interaction.followUp(profileMessagePayload);
    }
}

export default profile;
import { Button } from "@/interfaces";
import { getProfileMessagePayload } from "@/modules/messages";
import { setPublicTimeStats } from "@/modules/user";
import { profileStore } from "@/stores/profileStore";
import { ButtonInteraction } from "discord.js";

const profileTimePublic: Button = {
    customId: `profileTimePublic`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        await setPublicTimeStats(interaction.user);

        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = interaction.user.id;
    
        const profileMessagePayload = await getProfileMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileTimePublic;
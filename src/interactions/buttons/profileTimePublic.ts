import { ButtonInteraction } from "discord.js";
import { Button } from "@/interfaces";
import { getUserMessagePayload } from "@/modules/messages";
import { setPublicTimeStats } from "@/modules/user";
import { profileStore } from "@/stores/profileStore";

const profileTimePublic: Button = {
    customId: `profileTimePublic`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        await setPublicTimeStats(interaction.user);

        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = interaction.user.id;
    
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileTimePublic;
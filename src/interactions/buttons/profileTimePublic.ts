import { Button } from "@/interfaces";
import { getErrorMessagePayload, getProfileMessagePayload } from "@/modules/messages";
import { updateUserPublicTimeStatistics } from "@/modules/user";
import { profileStore, restoreProfileState } from "@/stores/profileStore";
import { ButtonInteraction } from "discord.js";

const profileTimePublic: Button = {
    customId: `profileTimePublic`,
    run: async (client, interaction, ...args) => {
        await interaction.deferUpdate();
        restoreProfileState(interaction.user.id, args);

        if (!interaction.guildId) {
            await interaction.editReply(getErrorMessagePayload());
            return;
        }

        await updateUserPublicTimeStatistics({ userId: interaction.user.id });

        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = interaction.user.id;
    
        const profileMessagePayload = await getProfileMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileTimePublic;
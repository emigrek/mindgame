import { Button } from "@/interfaces";
import { getErrorMessagePayload, getProfileMessagePayload } from "@/modules/messages";
import { updateUserGuildTimePublic } from "@/modules/user-guild-statistics/userGuildStatistics";
import { profileStore } from "@/stores/profileStore";
import { ButtonInteraction } from "discord.js";

const profileTimePublic: Button = {
    customId: `profileTimePublic`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guildId) {
            await interaction.editReply(getErrorMessagePayload());
            return;
        }

        await updateUserGuildTimePublic({ userId: interaction.user.id, guildId: interaction.guildId });

        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = interaction.user.id;
    
        const profileMessagePayload = await getProfileMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileTimePublic;
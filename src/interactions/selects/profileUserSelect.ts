import { Select } from "@/interfaces";
import { getProfileMessagePayload } from "@/modules/messages";
import { profileStore } from "@/stores/profileStore";
import { UserSelectMenuInteraction } from "discord.js";

export const profileUserSelect: Select = {
    customId: "profileUserSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = interaction.values[0] || interaction.user.id;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as UserSelectMenuInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}
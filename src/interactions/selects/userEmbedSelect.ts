import { Select } from "@/interfaces";
import { getUserMessagePayload } from "@/modules/messages";
import { ProfilePages, profileStore } from "@/stores/profileStore";
import { StringSelectMenuInteraction } from "discord.js";

export const userEmbedSelect: Select = {
    customId: "userEmbedSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const profileState = profileStore.get(interaction.user.id);
        profileState.page = interaction.values[0] as ProfilePages;

        const profileMessagePayload = await getUserMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}
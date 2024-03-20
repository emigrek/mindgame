import { ProfilePages, Select } from "@/interfaces";
import { getProfileMessagePayload } from "@/modules/messages";
import { profileStore } from "@/stores/profileStore";
import { StringSelectMenuInteraction } from "discord.js";

export const profileEmbedSelect: Select = {
    customId: "profileEmbedSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const profileState = profileStore.get(interaction.user.id);
        profileState.page = interaction.values[0] as ProfilePages;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}
import { Button } from "@/interfaces";
import { getProfileMessagePayload } from "@/modules/messages";
import { achievementsStore } from "@/stores/achievementsStore";
import { restoreProfileState } from "@/stores/profileStore";
import { ButtonInteraction } from "discord.js";

const achievementsPageUp: Button = {
    customId: `achievementsPageUp`,
    run: async (client, interaction, ...args) => {
        await interaction.deferUpdate();
        restoreProfileState(interaction.user.id, args);

        const achievementsState = achievementsStore.get(interaction.user.id);
        achievementsState.page = achievementsState.page - 1;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default achievementsPageUp;
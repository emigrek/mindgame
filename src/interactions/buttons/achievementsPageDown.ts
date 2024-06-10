import { Button } from "@/interfaces";
import { getProfileMessagePayload } from "@/modules/messages";
import { achievementsStore } from "@/stores/achievementsStore";
import { ButtonInteraction } from "discord.js";

const achievementsPageDown: Button = {
    customId: `achievementsPageDown`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const achievementsState = achievementsStore.get(interaction.user.id);
        achievementsState.page = achievementsState.page + 1;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}

export default achievementsPageDown;
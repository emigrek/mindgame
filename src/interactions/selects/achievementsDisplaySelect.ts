import { Select } from "@/interfaces";
import { getProfileMessagePayload } from "@/modules/messages";
import { achievementsStore } from "@/stores/achievementsStore";
import { StringSelectMenuInteraction } from "discord.js";

export const achievementsDisplaySelect: Select = {
    customId: "achievementsDisplaySelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const achievementsState = achievementsStore.get(interaction.user.id);
        let values = interaction.values;
        if (values.includes("all") && values.length > 1) {
            values = values.filter((value) => value !== "all");
        } else if (values.includes("unlocked") && values.includes("inprogress")) {
            values = ["all"];
        }
        achievementsState.display = values;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}
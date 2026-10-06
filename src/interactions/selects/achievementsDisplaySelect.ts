import { Select } from "@/interfaces";
import { getErrorMessagePayload, getProfileMessagePayload } from "@/modules/messages";
import { achievementsStore } from "@/stores/achievementsStore";
import { restoreProfileState } from "@/stores/profileStore";
import { MessageFlags, StringSelectMenuInteraction } from "discord.js";

const fixInteractionValues = (values: string[]) => {
    if (values.includes("all") && values.length > 1) {
        return ["all"];
    } else if (values.includes("unlocked") && values.includes("inprogress")) {
        return ["all"];
    }
    return values;
}

export const achievementsDisplaySelect: Select = {
    customId: "achievementsDisplaySelect",
    run: async (client, interaction, ...args) => {
        await interaction.deferUpdate();
        restoreProfileState(interaction.user.id, args);
        
        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral });
            return;
        }

        const achievementsState = achievementsStore.get(interaction.user.id);
        achievementsState.display = fixInteractionValues(interaction.values);

        achievementsState.page = 1;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as StringSelectMenuInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}
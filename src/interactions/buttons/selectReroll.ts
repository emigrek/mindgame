import { Button } from "@/interfaces";
import { getSelectMessagePayload } from "@/modules/messages";
import { selectOptionsStore } from "@/stores/selectOptionsStore";

const selectReroll: Button = {
    customId: "selectReroll",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const isInteractionAuthor = interaction.message.interaction?.user.id === interaction.user.id;
        if (isInteractionAuthor) {
            const selectOptionsState = selectOptionsStore.get(interaction.user.id);
            selectOptionsState.reroll = selectOptionsState.reroll + 1;

            const selectMessagePayload = await getSelectMessagePayload(client, interaction, false);
            const reply = await interaction.editReply(selectMessagePayload);
            
            setTimeout(async () => {
                

                const selectMessagePayload = await getSelectMessagePayload(client, interaction, true);
                await reply.edit(selectMessagePayload);
            }, 2000);
        }
    }
}

export default selectReroll;
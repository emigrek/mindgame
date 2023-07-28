import { Button } from "@/interfaces";

const selectMessageDelete: Button = {
    customId: "selectMessageDelete",
    run: async (client, interaction) => {
        const selectMessage = await interaction.channel?.messages.fetch(interaction.message.id);
        if(!selectMessage) return;

        const isInteractionAuthor = selectMessage.interaction?.user.id === interaction.user.id;
        if (isInteractionAuthor) {
            await selectMessage.delete();
        }
    }
}

export default selectMessageDelete;
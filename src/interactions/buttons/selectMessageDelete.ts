import { Button } from "@/interfaces";

const selectMessageDelete: Button = {
    customId: "selectMessageDelete",
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        const selectMessage = await interaction.channel?.messages.fetch(interaction.message.id);
        if (selectMessage) {
            await selectMessage.delete();
        }
    }
}

export default selectMessageDelete;
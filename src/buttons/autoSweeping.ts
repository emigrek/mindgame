import { Button } from "../interfaces/Button";
import { setAutoSweeing } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";

const autoSweeping: Button = {
    customId: `autoSweeping`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        await setAutoSweeing(interaction.guild!);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.editReply({
            components: configMessage!.components
        });
    }
}

export default autoSweeping;
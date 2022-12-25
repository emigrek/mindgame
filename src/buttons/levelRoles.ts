import { Button } from "../interfaces/Button";
import { setLevelRoles } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";

const levelRoles: Button = {
    customId: `levelRoles`,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        await setLevelRoles(interaction.guild!);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.followUp({ ...configMessage, ephemeral: true });
    }
}

export default levelRoles;
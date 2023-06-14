import { Button } from "../interfaces/Button";
import { setLevelRoles } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { syncGuildLevelRoles } from "../modules/roles";

const levelRoles: Button = {
    customId: `levelRoles`,
    run: async (client, interaction) => {
        if(!interaction.guild) return;
        await interaction.deferUpdate();

        const syncSuccess = await syncGuildLevelRoles(client, interaction, interaction.guild);
        if(syncSuccess) {
            await setLevelRoles(interaction.guild);
        }
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild);
        await interaction.editReply(configMessage);
    }
}

export default levelRoles;
import { Button } from "../interfaces/Button";
import { setLevelRoles } from "../modules/guild";
import { getConfigMessagePayload, getErrorMessagePayload } from "../modules/messages";
import { syncGuildLevelRoles } from "../modules/roles";

const levelRoles: Button = {
    customId: `levelRoles`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if(!interaction.guild) {
            await interaction.followUp(getErrorMessagePayload(client));
            return;
        }

        const syncSuccess = await syncGuildLevelRoles(client, interaction, interaction.guild);
        if(syncSuccess) {
            await setLevelRoles(interaction.guild);
        }
        
        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}

export default levelRoles;
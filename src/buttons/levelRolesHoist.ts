import { Button } from "../interfaces/Button";
import { setLevelRolesHoist } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { syncGuildLevelRolesHoisting } from "../modules/roles";

const levelRolesHoist: Button = {
    customId: `levelRolesHoist`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        if(!interaction.guild) return;

        const syncSuccess = await syncGuildLevelRolesHoisting(client, interaction, interaction.guild);
        if(syncSuccess) {
            await setLevelRolesHoist(interaction.guild);
        }
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild);
        await interaction.editReply(configMessage);
    }
}

export default levelRolesHoist;
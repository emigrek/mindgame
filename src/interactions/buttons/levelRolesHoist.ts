import { Button } from "@/interfaces";
import { setLevelRolesHoist } from "@/modules/guild";
import { getConfigMessagePayload, getErrorMessagePayload } from "@/modules/messages";
import { syncGuildLevelRolesHoisting } from "@/modules/roles";

const levelRolesHoist: Button = {
    customId: `levelRolesHoist`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if(!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const syncSuccess = await syncGuildLevelRolesHoisting(client, interaction, interaction.guild);
        if(syncSuccess) {
            await setLevelRolesHoist(interaction.guild);
        }
        
        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}

export default levelRolesHoist;
import { Button } from "../interfaces/Button";
import { setLevelRolesHoist } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { syncGuildLevelRolesHoisting } from "../modules/roles";

const levelRolesHoist: Button = {
    customId: `levelRolesHoist`,
    run: async (client, interaction) => {
        if(!interaction.guild) return;
        await interaction.deferUpdate();

        await setLevelRolesHoist(interaction.guild);
        await syncGuildLevelRolesHoisting(client, interaction.guild);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild);
        await interaction.editReply({
            components: configMessage!.components
        });
    }
}

export default levelRolesHoist;
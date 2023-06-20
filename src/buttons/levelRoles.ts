import { Button } from "../interfaces/Button";
import { setLevelRoles } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";
import { syncGuildLevelRoles } from "../modules/roles";

const levelRoles: Button = {
    customId: `levelRoles`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }

        const syncSuccess = await syncGuildLevelRoles(client, interaction, interaction.guild);
        if(syncSuccess) {
            await setLevelRoles(interaction.guild);
        }
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild);
        await interaction.editReply(configMessage);
    }
}

export default levelRoles;
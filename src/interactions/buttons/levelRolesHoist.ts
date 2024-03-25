import { Button } from "@/interfaces";
import { setLevelRolesHoist } from "@/modules/guild";
import { getConfigMessagePayload, getErrorMessagePayload } from "@/modules/messages";
import { syncGuildLevelRolesHoisting } from "@/modules/roles";

const levelRolesHoist: Button = {
    customId: `levelRolesHoist`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const success = await syncGuildLevelRolesHoisting(interaction);
        if (success) {
            await setLevelRolesHoist(interaction.guild.id);
        }

        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}

export default levelRolesHoist;
import { Button } from "@/interfaces";
import { setLevelRoles } from "@/modules/guild";
import { getConfigMessagePayload, getErrorMessagePayload } from "@/modules/messages";
import { syncGuildLevelRoles } from "@/modules/roles";

const levelRoles: Button = {
    customId: `levelRoles`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const success = await syncGuildLevelRoles({ client, interaction });
        if (success) {
            await setLevelRoles(interaction.guild.id);
        }

        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}

export default levelRoles;
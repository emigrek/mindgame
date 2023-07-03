import { Button } from "@/interfaces";
import { getColorMessagePayload } from "@/modules/messages";
import { updateColorRole } from "@/modules/roles";
import { WarningEmbed } from "@/modules/messages/embeds";

const roleColorUpdate: Button = {
    customId: `roleColorUpdate`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.followUp({ embeds: [
                WarningEmbed()
                    .setDescription("utils.guildOnly")
            ], ephemeral: true });
            return;
        }

        await updateColorRole(client, interaction);

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorUpdate;
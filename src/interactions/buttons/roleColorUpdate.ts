import { GuildMember } from "discord.js";
import { Button } from "@/interfaces";
import { getColorMessagePayload, getErrorMessagePayload } from "@/modules/messages";
import { updateColorRole } from "@/modules/roles";

const roleColorUpdate: Button = {
    customId: `roleColorUpdate`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const success = await updateColorRole(client, interaction.member as GuildMember);
        if (!success) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorUpdate;
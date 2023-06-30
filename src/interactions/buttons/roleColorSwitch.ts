import { GuildMember } from "discord.js";
import { Button } from "@/interfaces";
import { getColorMessagePayload, getErrorMessagePayload } from "@/modules/messages";
import { switchColorRole } from "@/modules/roles";

const roleColorSwitch: Button = {
    customId: `roleColorSwitch`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const success = await switchColorRole(client, interaction.member as GuildMember);
        if (!success) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorSwitch;
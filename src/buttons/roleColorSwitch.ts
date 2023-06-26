import { GuildMember } from "discord.js";
import { Button } from "../interfaces/Button";
import { getColorMessagePayload, getErrorMessagePayload } from "../modules/messages";
import { switchColorRole } from "../modules/roles";

const roleColorSwitch: Button = {
    customId: `roleColorSwitch`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        
        if(!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(client), ephemeral: true });
            return;
        }

        await switchColorRole(client, interaction.member as GuildMember);
        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorSwitch;
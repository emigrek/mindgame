import { GuildMember } from "discord.js";
import { Button } from "../interfaces/Button";
import { getColorMessagePayload } from "../modules/messages";
import { updateColorRole } from "../modules/roles";

const roleColorUpdate: Button = {
    customId: `roleColorUpdate`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("guildOnly"));
            return;
        }
        
        await updateColorRole(client, interaction.member as GuildMember);
        
        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorUpdate;
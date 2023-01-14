import { GuildMember } from "discord.js";
import { Button } from "../interfaces/Button";
import { withGuildLocale } from "../modules/locale";
import { getColorMessagePayload } from "../modules/messages";
import { updateColorRole } from "../modules/roles";

const roleColorUpdate: Button = {
    customId: `roleColorUpdate`,
    run: async (client, interaction) => {
        if(!interaction.guild) return;
        await interaction.deferUpdate();

        await withGuildLocale(client, interaction.guild!);
        await updateColorRole(client, interaction.member as GuildMember);

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply({ ...colorMessagePayload });
    }
}

export default roleColorUpdate;
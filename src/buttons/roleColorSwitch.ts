import { GuildMember } from "discord.js";
import { Button } from "../interfaces/Button";
import { withGuildLocale } from "../modules/locale";
import { getColorMessagePayload } from "../modules/messages";
import { switchColorRole } from "../modules/roles";

const roleColorSwitch: Button = {
    customId: `roleColorSwitch`,
    run: async (client, interaction) => {
        if(!interaction.guild) return;
        await interaction.deferUpdate();

        await withGuildLocale(client, interaction.guild!);
        await switchColorRole(client, interaction.member as GuildMember);

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorSwitch;
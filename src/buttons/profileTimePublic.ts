import { ButtonInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { getUserMessagePayload } from "../modules/messages";
import { setPublicTimeStats } from "../modules/user";

const profileTimePublic: Button = {
    customId: `profileTimePublic`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        await setPublicTimeStats(interaction.user);
    
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction, interaction.user.id);
        await interaction.editReply(profileMessagePayload);
    }
}

export default profileTimePublic;
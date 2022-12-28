import { ButtonInteraction, UserContextMenuCommandInteraction } from "discord.js";
import { Button } from "../interfaces/Button";
import { getUserMessagePayload } from "../modules/messages";
import { getUser, updateUserStatistics } from "../modules/user";

const profileTimePublic: Button = {
    customId: `profileTimePublic`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if(!interaction.guild) return;
        const userSource = await getUser(interaction.user);
        if(!userSource) return;

        await updateUserStatistics(client, interaction.user, {
            time: {
                public: !userSource.stats.time.public
            }
        })
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as ButtonInteraction);
        await interaction.editReply({
            files: profileMessagePayload!.files,
            components: profileMessagePayload!.components
        });
    }
}

export default profileTimePublic;
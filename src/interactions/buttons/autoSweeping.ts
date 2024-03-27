import {Button} from "@/interfaces";
import {setAutoSweeping} from "@/modules/guild";
import {getConfigMessagePayload, getErrorMessagePayload} from "@/modules/messages";

const autoSweeping: Button = {
    customId: `autoSweeping`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();
        
        if(!interaction.guild) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        await setAutoSweeping(interaction.guild.id);
        
        const configMessage = await getConfigMessagePayload(client, interaction);
        await interaction.editReply(configMessage);
    }
}

export default autoSweeping;
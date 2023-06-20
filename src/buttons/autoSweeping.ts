import { Button } from "../interfaces/Button";
import { setAutoSweeing } from "../modules/guild";
import { getConfigMessagePayload } from "../modules/messages";

const autoSweeping: Button = {
    customId: `autoSweeping`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }

        await setAutoSweeing(interaction.guild);
        
        const configMessage = await getConfigMessagePayload(client, interaction.guild);
        await interaction.editReply(configMessage);
    }
}

export default autoSweeping;
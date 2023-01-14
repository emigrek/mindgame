import { Button } from "../interfaces/Button";

const roleColorUpdate: Button = {
    customId: `roleColorUpdate`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        // update current color role
        // set color to accentColor
    }
}

export default roleColorUpdate;
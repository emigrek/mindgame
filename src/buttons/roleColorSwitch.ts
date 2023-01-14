import { Button } from "../interfaces/Button";

const roleColorSwitch: Button = {
    customId: `roleColorSwitch`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        // TODO
        // if user has role color, remove it.
        // if user doesn't have role color, add it.
        // pull color from hexAccentColor
    }
}

export default roleColorSwitch;
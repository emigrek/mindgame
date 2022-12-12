import { PermissionFlagsBits } from "discord.js";
import { Button } from "../interfaces/Button";

const remove: Button = {
    customId: `remove`,
    permissions: [PermissionFlagsBits.Administrator],
    run: async (client, interaction) => {
        interaction.message.delete();
    }
}

export default remove;
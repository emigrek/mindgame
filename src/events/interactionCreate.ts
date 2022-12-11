import { Event } from "../interfaces";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        if(interaction.isCommand()) {
            client.commands.get(interaction.commandName)?.execute(client, interaction);
        }
        if(interaction.isStringSelectMenu() || interaction.isButton()) {
            client.interactions.get(interaction.customId)?.run(client, interaction);
        }
    }
}
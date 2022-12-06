import { Event } from "../interfaces/Event";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        if(interaction.isCommand()) return;
        client.interactions.get(interaction.customId)?.run(client, interaction);
    }
}
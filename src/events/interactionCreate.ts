import { Event } from "../interfaces";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        if(interaction.isCommand()) {
            client.commands.get(interaction.commandName)?.execute(client, interaction);
        }
        if(interaction.isStringSelectMenu() || interaction.isButton()) {
            const sourceInteraction = client.interactions.get(interaction.customId);

            if(sourceInteraction?.permissions) {
                if(!interaction.member.permissions.has(sourceInteraction.permissions)) {
                    return interaction.reply({
                        content: client.i18n.__("utils.noPermissions"),
                        ephemeral: true
                    });
                }
            }

            client.interactions.get(interaction.customId)?.run(client, interaction);
        }
    }
}
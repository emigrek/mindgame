import { Event } from "../interfaces";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        const sourceInteraction = client.interactions.get(interaction.customId);

        if(sourceInteraction?.permissions) {
            if(!interaction.member.permissions.has(sourceInteraction.permissions)) {
                return interaction.reply({
                    content: client.i18n.__("utils.noPermissions"),
                    ephemeral: true
                });
            }
        }

        if(interaction.isCommand()) {
            client.commands.get(interaction.commandName)?.execute(client, interaction);
        }
        if(interaction.isAnySelectMenu()) {
            client.selects.get(interaction.customId)?.run(client, interaction);
        }
        if(interaction.isButton()) {
            client.buttons.get(interaction.customId)?.run(client, interaction);
        }
        if(interaction.isContextMenuCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            client.contexts.get(interaction.commandName)?.run(client, interaction);
        }
    }
}
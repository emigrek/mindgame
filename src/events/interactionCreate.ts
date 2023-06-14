import { Event } from "../interfaces";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        const sourceInteraction = client.interactions.get(interaction.customId);

        if (sourceInteraction?.permissions) {
            if (!interaction.member.permissions.has(sourceInteraction.permissions)) {
                return interaction.reply({
                    content: client.i18n.__("utils.noPermissions"),
                    ephemeral: true
                });
            }
        }

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.options?.ownerOnly) {
                if (!process.env.OWNER_ID) {
                    interaction.reply({ content: `If you are the bot owner, please set the OWNER_ID environment variable.`, ephemeral: true });
                    return;
                }
                if (process.env.OWNER_ID !== interaction.user.id) {
                    interaction.reply({ content: `You are not the bot owner.`, ephemeral: true });
                    return;
                }
            }

            client.commands.get(interaction.commandName)?.execute(client, interaction);
        }
        if (interaction.isAnySelectMenu()) {
            client.selects.get(interaction.customId)?.run(client, interaction);
        }
        if (interaction.isButton()) {
            client.buttons.get(interaction.customId)?.run(client, interaction);
        }
        if (interaction.isContextMenuCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            client.contexts.get(interaction.commandName)?.run(client, interaction);
        }
    }
}
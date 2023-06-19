import { Event } from "../interfaces";
import config from "../utils/config";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        const sourceInteraction = client.interactions.get(interaction.customId);

        const locale = interaction.guild ? interaction.guild.preferredLocale : interaction.locale;
        client.i18n.setLocale(locale);

        if (sourceInteraction?.permissions) {
            if (!interaction.member.permissions.has(sourceInteraction.permissions)) {
                return interaction.reply({
                    content: client.i18n.__("utils.noPermissions"),
                    ephemeral: true
                });
            }
        }

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.options?.ownerOnly) {
                if (config.ownerId !== interaction.user.id) {
                    interaction.reply({ content: client.i18n.__("ownerOnly"), ephemeral: true });
                    return;
                }
            }

            command.execute(client, interaction);
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
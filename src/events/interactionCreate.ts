import i18n from "@/client/i18n";
import { Event } from "@/interfaces";
import { getErrorMessagePayload } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { getUser, updateUserStatistics } from "@/modules/user";
import config from "@/utils/config";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        i18n.setLocale(interaction.locale);
        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command)
                    return;

                if (command.options?.ownerOnly) {
                    if (config.ownerId !== interaction.user.id) {
                        return interaction.reply({
                            embeds: [
                                WarningEmbed()
                                    .setDescription(i18n.__("utils.ownerOnly"))
                            ], ephemeral: true
                        });
                    }
                }

                if (command.options?.level) {
                    const user = await getUser(interaction.user);
                    if (!user) {
                        return interaction.reply({
                            embeds: [
                                WarningEmbed()
                                    .setDescription(i18n.__("utils.userNotFound"))
                            ], ephemeral: true
                        });
                    }

                    if (user.stats.level < command.options.level) {
                        return interaction.reply({
                            embeds: [
                                WarningEmbed()
                                    .setDescription(i18n.__mf("utils.levelRequirement", {
                                        level: command.options.level
                                    }))
                            ], ephemeral: true
                        })
                    }
                }

                command.execute(client, interaction)
                    .then(() => {
                        updateUserStatistics(client, interaction.user, {
                            commands: 1
                        });
                    })
            }
            if (interaction.isModalSubmit()) {
                client.modals.get(interaction.customId)?.run(client, interaction);
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
        } catch (error) {
            console.error(error);
            await interaction.reply({ ...getErrorMessagePayload(), ephemeral: true });
        }
    }
}
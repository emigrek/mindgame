import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { Event } from "@/interfaces";
import { WarningEmbed } from "@/modules/messages/embeds";
import { getUser, updateUserStatistics } from "@/modules/user";
import config from "@/utils/config";
import { BaseInteraction } from "discord.js";

export const interactionCreate: Event = {
    name: "interactionCreate",
    run: async (client: ExtendedClient, interaction: BaseInteraction) => {
        i18n.setLocale(interaction.locale);

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command)
                return;

            if (command.options?.ownerOnly) {
                if (config.ownerId !== interaction.user.id) {
                    await interaction.reply({
                        embeds: [
                            WarningEmbed()
                                .setDescription(i18n.__("utils.ownerOnly"))
                        ], ephemeral: true
                    });
                    return;
                }
            }

            if (command.options?.level) {
                const user = await getUser(interaction.user);
                if (!user) {
                    await interaction.reply({
                        embeds: [
                            WarningEmbed()
                                .setDescription(i18n.__("utils.userNotFound"))
                        ], ephemeral: true
                    });
                    return;
                }

                if (user.stats.level < command.options.level) {
                    await interaction.reply({
                        embeds: [
                            WarningEmbed()
                                .setDescription(i18n.__mf("utils.levelRequirement", {
                                    level: command.options.level
                                }))
                        ], ephemeral: true
                    });
                    return;
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
    }
}
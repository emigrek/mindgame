import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { keys } from "@/config";
import { Event } from "@/interfaces";
import { WarningEmbed } from "@/modules/messages/embeds";
import { getUserGuildStatistics, updateUserGuildStatistics } from "@/modules/user-guild-statistics/userGuildStatistics";
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
                if (keys.ownerId !== interaction.user.id) {
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
                if (!interaction.guild) return;
                const userGuildStatistics = await getUserGuildStatistics({
                    userId: interaction.user.id,
                    guildId: interaction.guild.id,
                })
                if (!userGuildStatistics) {
                    await interaction.reply({
                        embeds: [
                            WarningEmbed()
                                .setDescription(i18n.__("utils.userNotFound"))
                        ], ephemeral: true
                    });
                    return;
                }

                if (userGuildStatistics.level < command.options.level) {
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
                .catch((e) => console.log(`Error executing ChatInputCommand: ${e}`))
                .then(() => {
                    if (!interaction.guild) return;

                    updateUserGuildStatistics({
                        client,
                        userId: interaction.user.id,
                        guildId: interaction.guild.id,
                        update: {
                            commands: 1
                        }
                    })
                });
        } else if (interaction.isModalSubmit()) {
            client.modals
                .get(interaction.customId)
                ?.run(client, interaction)
                .catch((e) => console.log(`Error executing ModalSubmit: ${e}`));
        } else if (interaction.isAnySelectMenu()) {
            client.selects
                .get(interaction.customId)
                ?.run(client, interaction)
                .catch((e) => console.log(`Error executing SelectMenu: ${e}`));
        } else if (interaction.isButton()) {
            client.buttons
                .get(interaction.customId)
                ?.run(client, interaction)
                .catch((e) => console.log(`Error executing Button: ${e}`));
        } else if (interaction.isContextMenuCommand()) {
            client.contexts
                .get(interaction.commandName)
                ?.run(client, interaction)
                .catch((e) => console.log(`Error executing ContextMenuCommand: ${e}`));
        }
    }
}   
import i18n from "@/client/i18n";
import { keys } from "@/config";
import { Event } from "@/interfaces";
import { getErrorMessagePayload } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { getUserGuildStatistics, updateUserGuildStatistics } from "@/modules/user-guild-statistics/userGuildStatistics";
import { CommandInteraction, MessageComponentInteraction, MessageFlags, ModalSubmitInteraction } from "discord.js";

type RepliableInteraction = CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;

// Logs with context and tells the user, instead of leaving the interaction "thinking..." forever
const runSafely = async (interaction: RepliableInteraction, label: string, run: () => Promise<unknown>) => {
    try {
        await run();
        return true;
    } catch (e) {
        console.error(`[Interaction:${label}] user=${interaction.user.id} guild=${interaction.guildId}`, e);
        const payload = { ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral as const };
        await (interaction.deferred || interaction.replied ? interaction.followUp(payload) : interaction.reply(payload))
            .catch(() => null);
        return false;
    }
}

// Components from removed features, or an old panel after a handler rename
const replyExpired = async (interaction: RepliableInteraction) => {
    await interaction.reply({
        embeds: [
            WarningEmbed()
                .setDescription(i18n.__("utils.expired"))
        ], flags: MessageFlags.Ephemeral
    }).catch(() => null);
}

export const interactionCreate: Event<"interactionCreate"> = {
    name: "interactionCreate",
    run: async (client, interaction) => {
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
                        ], flags: MessageFlags.Ephemeral
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

                if (userGuildStatistics.level < command.options.level) {
                    await interaction.reply({
                        embeds: [
                            WarningEmbed()
                                .setDescription(i18n.__mf("utils.levelRequirement", {
                                    level: command.options.level
                                }))
                        ], flags: MessageFlags.Ephemeral
                    });
                    return;
                }
            }

            const succeeded = await runSafely(interaction, `command:${interaction.commandName}`, () => command.execute(client, interaction));
            if (!succeeded || !interaction.guild) return;

            await updateUserGuildStatistics({
                client,
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                update: {
                    commands: 1
                }
            }).catch(e => console.error("[Interaction] Error counting command", e));
        } else if (interaction.isContextMenuCommand()) {
            const context = client.contexts.get(interaction.commandName);
            if (!context) return replyExpired(interaction);
            await runSafely(interaction, `context:${interaction.commandName}`, () => context.run(client, interaction));
        } else if (interaction.isModalSubmit() || interaction.isMessageComponent()) {
            // Components can carry state after the handler name, e.g. "profileFollow:<userId>:<page>"
            const [customId, ...args] = interaction.customId.split(":");

            if (interaction.isModalSubmit()) {
                const modal = client.modals.get(customId);
                if (!modal) return replyExpired(interaction);
                await runSafely(interaction, `modal:${customId}`, () => modal.run(client, interaction, ...args));
            } else if (interaction.isAnySelectMenu()) {
                const select = client.selects.get(customId);
                if (!select) return replyExpired(interaction);
                await runSafely(interaction, `select:${customId}`, () => select.run(client, interaction, ...args));
            } else if (interaction.isButton()) {
                const button = client.buttons.get(customId);
                if (!button) return replyExpired(interaction);
                await runSafely(interaction, `button:${customId}`, () => button.run(client, interaction, ...args));
            }
        }
    }
}

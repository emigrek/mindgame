import {Command} from "@/interfaces";
import {InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import timeoutVariants from "@/modules/ephemeral-channel/timeoutVariants";
import {getEphemeralChannelMessagePayload} from "@/modules/messages";
import i18n from "@/client/i18n";

// Names are literals: they are read back as literals (getSubcommand/getChannel), so building them from en-US
// translations broke the command whenever a translation changed. loadLocalizations() localizes them.
export const ephemeralChannel: Command = {
    data: new SlashCommandBuilder()
        .setName("ephemeral-channel")
        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.description"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.create.description"))
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.channel.description"))
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("timeout")
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.timeout.description"))
                        .setRequired(true)
                        .addChoices(...timeoutVariants)
                )
                .addBooleanOption(option =>
                    option
                        .setName("keep-messages-with-reactions")
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.keep-messages-with-reactions.description"))
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("edit")
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.edit.description"))
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.channel.description"))
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("timeout")
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.timeout.description"))
                        .setRequired(false)
                        .addChoices(...timeoutVariants)
                )
                .addBooleanOption(option =>
                    option
                        .setName("keep-messages-with-reactions")
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.keep-messages-with-reactions.description"))
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("delete")
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.delete.description"))
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.channel.description"))
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.list.description"))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild),
    execute: async (client, interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const ephemeralChannelMessagePayload = await getEphemeralChannelMessagePayload(client, interaction);
        await interaction.followUp(ephemeralChannelMessagePayload);
    }
}
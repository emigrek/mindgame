import {Command} from "@/interfaces";
import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import timeoutVariants from "@/modules/ephemeral-channel/timeoutVariants";
import {getEphemeralChannelMessagePayload} from "@/modules/messages";
import i18n from "@/client/i18n";

export const ephemeralChannel: Command = {
    data: new SlashCommandBuilder()
        .setName("ephemeral-channel")
        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.description"))
        .addSubcommand(subcommand =>
            subcommand
                .setName(i18n.__("commandLocalizations.ephemeral-channel.subcommand.create.name"))
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.create.description"))
                .addChannelOption(option =>
                    option
                        .setName(i18n.__("commandLocalizations.ephemeral-channel.option.channel.name"))
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.channel.description"))
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName(i18n.__("commandLocalizations.ephemeral-channel.option.timeout.name"))
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.timeout.description"))
                        .setRequired(true)
                        .addChoices(...timeoutVariants)
                )
                .addBooleanOption(option =>
                    option
                        .setName(i18n.__("commandLocalizations.ephemeral-channel.option.keep-messages-with-reactions.name"))
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.keep-messages-with-reactions.description"))
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(i18n.__("commandLocalizations.ephemeral-channel.subcommand.edit.name"))
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.edit.description"))
                .addChannelOption(option =>
                    option
                        .setName(i18n.__("commandLocalizations.ephemeral-channel.option.channel.name"))
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.channel.description"))
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName(i18n.__("commandLocalizations.ephemeral-channel.option.timeout.name"))
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.timeout.description"))
                        .setRequired(false)
                        .addChoices(...timeoutVariants)
                )
                .addBooleanOption(option =>
                    option
                        .setName(i18n.__("commandLocalizations.ephemeral-channel.option.keep-messages-with-reactions.name"))
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.keep-messages-with-reactions.description"))
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(i18n.__("commandLocalizations.ephemeral-channel.subcommand.delete.name"))
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.delete.description"))
                .addChannelOption(option =>
                    option
                        .setName(i18n.__("commandLocalizations.ephemeral-channel.option.channel.name"))
                        .setDescription(i18n.__("commandLocalizations.ephemeral-channel.option.channel.description"))
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(i18n.__("commandLocalizations.ephemeral-channel.subcommand.list.name"))
                .setDescription(i18n.__("commandLocalizations.ephemeral-channel.subcommand.list.description"))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const ephemeralChannelMessagePayload = await getEphemeralChannelMessagePayload(client, interaction);
        await interaction.followUp(ephemeralChannelMessagePayload);
    }
}
import { Command } from "../interfaces";
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { createEphemeralChannel, deleteEphemeralChannel, editEphemeralChannel, getEphemeralChannel, getGuildsEphemeralChannels } from "../modules/ephemeral-channel";
import timeoutVariants from "../modules/ephemeral-channel/timeoutVariants";

export const ephemeralChannel: Command = {
    data: new SlashCommandBuilder()
        .setName('ephemeral-channel')
        .setDescription(`Set up ephemeral channel (messages in this channel will be deleted after time)`)
        .addSubcommand(subcommand => 
            subcommand
                .setName('create')
                .setDescription('Create ephemeral channel (messages in this channel will be deleted after set timeout)')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to create')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('timeout')
                        .setDescription('Deletion timeout in minutes')
                        .setRequired(true)
                        .addChoices(...timeoutVariants)
                ),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit ephemeral channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to edit')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('timeout')
                        .setDescription('Deletion timeout in minutes')
                        .setRequired(true)
                        .addChoices(...timeoutVariants)
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('delete')
                .setDescription('Delete ephemeral channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to delete')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    execute: async (client, interaction) => {
        const { i18n } = client;
        await interaction.deferReply({ ephemeral: true });

        if(!interaction.guild) {
            await interaction.followUp(i18n.__("utils.guildOnly"));
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel')!;
        const timeout = interaction.options.getInteger('timeout')!;
        const exists = await getEphemeralChannel(channel.id);
        
        if(!(interaction.guild?.channels.cache.get(channel.id)?.type === ChannelType.GuildText)) {
            await interaction.followUp(i18n.__("utils.textChannelOnly"));
            return;
        }

        if(subcommand === 'create') {
            if(exists) {
                await interaction.followUp(i18n.__("ephemeralChannel.alreadyExists"));
                return;
            }

            const guildExisting = await getGuildsEphemeralChannels(interaction.guild.id);

            if(guildExisting.length >= 2) {
                await interaction.followUp(i18n.__("ephemeralChannel.limitReached"));
                return;
            }

            const ephemeralChannel = await createEphemeralChannel(interaction.guild.id, channel.id, timeout);
            await interaction.followUp(i18n.__mf("ephemeralChannel.created", {
                channelId: ephemeralChannel.channelId,
                timeout: ephemeralChannel.timeout.toString()
            }));
        }

        if(subcommand === 'edit') {
            const ephemeralChannel = await editEphemeralChannel(channel.id, timeout);
            
            if(!ephemeralChannel) {
                await interaction.followUp(i18n.__("ephemeralChannel.notFound"));
                return;
            }

            await interaction.followUp(i18n.__mf("ephemeralChannel.edited", {
                channelId: ephemeralChannel.channelId,
                timeout: ephemeralChannel.timeout.toString()
            }));
        }

        if(subcommand === 'delete') {
            const result = await deleteEphemeralChannel(channel.id);
            await interaction.followUp(result ? i18n.__mf("ephemeralChannel.deleted", {
                channelId: channel.id,
            }) : i18n.__("ephemeralChannel.notFound"));
        }
    }
}
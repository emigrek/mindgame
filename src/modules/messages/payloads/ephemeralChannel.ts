import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { createEphemeralChannel, deleteEphemeralChannel, editEphemeralChannel, getEphemeralChannel, getGuildsEphemeralChannels, syncEphemeralChannelMessages } from "@/modules/ephemeral-channel";
import { ChannelType, ChatInputCommandInteraction } from "discord.js";
import { InformationEmbed, WarningEmbed } from "@/modules/messages/embeds";

import { getErrorMessagePayload } from "@/modules/messages/error";

const getEphemeralChannelMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild)
        return getErrorMessagePayload();

    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');
    const timeout = interaction.options.getInteger('timeout') ?? undefined;
    const keepMessagesWithReactions = interaction.options.getBoolean('keep-messages-with-reactions') ?? undefined;

    switch(subcommand) {
        case 'create': {
            if (!timeout || !channel)
                return getErrorMessagePayload();

            const exists = await getEphemeralChannel(channel.id);
            if (exists) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("ephemeralChannel.alreadyExists"))
                    ]
                }
            }

            if (!(interaction.guild?.channels.cache.get(channel.id)?.type === ChannelType.GuildText)) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("utils.textChannelOnly"))
                    ]
                };
            }

            const guildExisting = await getGuildsEphemeralChannels(interaction.guild.id);
            if (guildExisting.length >= 2) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("ephemeralChannel.limitReached"))
                    ]
                }
            }

            await createEphemeralChannel({ guildId: interaction.guild.id, keepMessagesWithReactions, channelId: channel.id, timeout });
            return {
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("ephemeralChannel.created"))
                ]
            }
        }

        case 'edit': {
            if (!channel)
                return getErrorMessagePayload();

            const ephemeralChannel = await editEphemeralChannel({ channelId: channel.id, update: { timeout, keepMessagesWithReactions } });
            if (!ephemeralChannel) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("ephemeralChannel.notFound"))
                    ]
                }
            }

            await syncEphemeralChannelMessages(client, ephemeralChannel);
            return {
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("ephemeralChannel.edited"))
                ]
            }
        }

        case 'list': {
            const guildExisting = await getGuildsEphemeralChannels(interaction.guild.id);
            const fields = guildExisting.map((ephemeralChannel) => {
                const channel = interaction.guild?.channels.cache.get(ephemeralChannel.channelId);
                return {
                    name: channel?.name || 'Unknown',
                    value: `${i18n.__("ephemeralChannel.timeout")}: \`${ephemeralChannel.timeout}min\`\n${i18n.__("ephemeralChannel.keepMessagesWithReactions")}: \`${ephemeralChannel.keepMessagesWithReactions ? '✔' : '❌'}\``,
                    inline: false,
                }
            });
            const embed = InformationEmbed()
                .setTitle(i18n.__("ephemeralChannel.listTitle"))
                .setFields(fields);

            if (!fields.length) {
                embed.setDescription(i18n.__("ephemeralChannel.empty"));
            }

            return {
                embeds: [embed]
            }
        }

        case 'delete': {
            if (!channel) {
                return getErrorMessagePayload();
            }

            const result = await deleteEphemeralChannel(channel.id);
            if (!result) {
                return {
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("ephemeralChannel.notFound"))
                    ]
                }
            }

            return {
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__mf("ephemeralChannel.deleted", { channelId: channel.id }))
                ]
            }
        }

        default: {
            return getErrorMessagePayload();
        }
    }
};

export { getEphemeralChannelMessagePayload };

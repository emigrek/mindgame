import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { getGuild } from "@/modules/guild";
import { getAutoSweepingButton, getLevelRolesButton, getLevelRolesHoistButton, getNotificationsButton } from "@/modules/messages/buttons";
import { getChannelSelect } from "@/modules/messages/selects";
import { ActionRowBuilder, AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { WarningEmbed } from "@/modules/messages/embeds";

import { getErrorMessagePayload } from "@/modules/messages/error";

const getConfigMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction) => {
    const { guild } = interaction;
    if (!guild)
        return getErrorMessagePayload();

    const sourceGuild = await getGuild(guild.id);
    if (!sourceGuild)
        return getErrorMessagePayload();

    const owner = await client.users.fetch(guild.ownerId);
    const textChannels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText);
    const currentDefault = textChannels.find((channel) => channel.id == sourceGuild.channelId);

    if (!textChannels.size) {
        await owner?.send({
            embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("config.noValidChannels"))
            ]
        });
        return getErrorMessagePayload();
    }

    const notificationsButton = getNotificationsButton({ guild: sourceGuild })
    const levelRolesButton = getLevelRolesButton({ guild: sourceGuild })
    const levelRolesHoistButton = getLevelRolesHoistButton({ guild: sourceGuild })
    const autoSweepingButton = getAutoSweepingButton({ guild: sourceGuild })
    const channelSelect = getChannelSelect(currentDefault as TextChannel | undefined);

    const row = new ActionRowBuilder<ChannelSelectMenuBuilder>()
        .setComponents(channelSelect);
    const row2 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(levelRolesButton, levelRolesHoistButton);
    const row3 = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(notificationsButton, autoSweepingButton);

    return {
        components: [row, row2, row3],
    };
}

export { getConfigMessagePayload };

import {ChannelType, DMChannel, GuildChannel, NonThreadGuildBasedChannel} from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {getEphemeralChannel} from "@/modules/ephemeral-channel";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";
import {deleteMessages} from "@/modules/messages";
import {getGuild} from "@/modules/guild";

export const channelDelete: Event = {
    name: "channelDelete",
    run: async (client: ExtendedClient, channel: DMChannel | GuildChannel) => {
        if (channel.isTextBased() && !channel.isDMBased()) {
            const sourceGuild = await getGuild(channel.guild.id);

            if (sourceGuild && sourceGuild.channelId === channel.id) {
                const channels = await channel.guild.channels.fetch();
                const textChannels = channels.filter((channel: NonThreadGuildBasedChannel | null) => channel && channel.type === ChannelType.GuildText);
                sourceGuild.channelId = textChannels.first()?.id || null;
                await sourceGuild.save();
            }

            await deleteMessages(channel.id);
        }

        const ephemeralChannel = await getEphemeralChannel(channel.id);
        if(ephemeralChannel) {
            ephemeralChannelMessageCache.removeChannel(channel.id);
            await ephemeralChannel.delete();
        }
    }
}
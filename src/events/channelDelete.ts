import { DMChannel, GuildChannel } from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getEphemeralChannel } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";

export const channelDelete: Event = {
    name: "channelDelete",
    run: async (client: ExtendedClient, channel: DMChannel | GuildChannel) => {
        const ephemeralChannel = await getEphemeralChannel(channel.id);
        if(ephemeralChannel) {
            ephemeralChannelMessageCache.removeChannel(channel.id);
            await ephemeralChannel.delete();
        }
    }
}
import {MessageReaction} from "discord.js";
import {Event} from "@/interfaces"
import {getEphemeralChannel, isMessageCacheable} from "@/modules/ephemeral-channel";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";
import ExtendedClient from "@/client/ExtendedClient";

export const messageReactionAdd: Event = {
    name: "messageReactionAdd",
    run: async (client: ExtendedClient, messageReaction: MessageReaction) => {
        const { message } = messageReaction;
        const { channel } = message;

        const ephemeralChannel = await getEphemeralChannel(channel.id);
        if(!ephemeralChannel) return;

        const m = message.partial ? await message.fetch() : message;
        const cacheable = await isMessageCacheable(ephemeralChannel, m);
        cacheable ? ephemeralChannelMessageCache.add(channel.id, m) : ephemeralChannelMessageCache.remove(channel.id, message.id);
    }
}
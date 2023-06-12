import { Event } from "../interfaces"
import { getEphemeralChannel } from "../modules/ephemeral-channel";
import { isMessageCacheable } from "../modules/ephemeral-channel";
import { MessageReaction } from "discord.js";
import { ephemeralChannelMessageCache } from "../modules/ephemeral-channel/cache";

export const messageReactionRemove: Event = {
    name: "messageReactionRemove",
    run: async (client, messageReaction: MessageReaction, user) => {
        const { message } = messageReaction;
        const { channel } = message;

        const ephemeralChannel = await getEphemeralChannel(channel.id);
        if(!ephemeralChannel) return;

        const m = message.partial ? await message.fetch() : message;
        const cacheable = await isMessageCacheable(m);
        cacheable ? ephemeralChannelMessageCache.add(channel.id, m) : ephemeralChannelMessageCache.remove(channel.id, message.id);
    }
}
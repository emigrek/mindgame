import {Event} from "@/interfaces";
import {getEphemeralChannel, isMessageCacheable} from "@/modules/ephemeral-channel";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";

export const messageReactionRemove: Event<"messageReactionRemove"> = {
    name: "messageReactionRemove",
    run: async (client, messageReaction) => {
        const { message } = messageReaction;
        const { channel } = message;

        const ephemeralChannel = await getEphemeralChannel(channel.id);
        if(!ephemeralChannel) return;

        const m = message.partial ? await message.fetch() : message;
        const cacheable = await isMessageCacheable(ephemeralChannel, m);
        cacheable ? ephemeralChannelMessageCache.add(channel.id, m) : ephemeralChannelMessageCache.remove(channel.id, message.id);
    }
}
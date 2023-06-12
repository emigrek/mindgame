import { Event } from "../interfaces";
import { getEphemeralChannel } from "../modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "../modules/ephemeral-channel/cache";
import { deleteMessage } from "../modules/messages"

export const messageDeleteBulk: Event = {
    name: "messageDeleteBulk",
    run: async (client, messages, channel) => {
        for await (const message of messages) {
            if (message.author.id === client.user?.id)
                await deleteMessage(message.id);

            const ephemeralChannel = await getEphemeralChannel(channel.id);
            if (ephemeralChannel) {
                ephemeralChannelMessageCache.remove(message.channel.id, message.id);
            }
        }
    }
}
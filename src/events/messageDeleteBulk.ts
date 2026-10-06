import {Event} from "@/interfaces";
import {getEphemeralChannel} from "@/modules/ephemeral-channel";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";
import {deleteMessage} from "@/modules/messages";

export const messageDeleteBulk: Event<"messageDeleteBulk"> = {
    name: "messageDeleteBulk",
    run: async (client, messages, channel) => {
        // One lookup for the whole batch, it used to run once per deleted message
        const ephemeralChannel = await getEphemeralChannel(channel.id);
        await Promise.all(
            messages.map(async (message) => {
                await deleteMessage(message.id);

                if (ephemeralChannel) {
                    ephemeralChannelMessageCache.remove(message.channel.id, message.id);
                }
            })
        );
    }
}
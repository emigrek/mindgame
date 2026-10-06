import {Event} from "@/interfaces";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";

// Emitted by discord-logs. Pinned messages in ephemeral channels are kept.
export const messagePinned: Event<"messagePinned"> = {
    name: "messagePinned",
    run: async (client, message) => {
        ephemeralChannelMessageCache.remove(message.channelId, message.id);
    }
}

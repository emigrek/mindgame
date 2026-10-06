import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";
import {Message} from "discord.js";

// Emitted by discord-logs. Pinned messages in ephemeral channels are kept.
export const messagePinned: Event = {
    name: "messagePinned",
    run: async (client: ExtendedClient, message: Message) => {
        ephemeralChannelMessageCache.remove(message.channelId, message.id);
    }
}

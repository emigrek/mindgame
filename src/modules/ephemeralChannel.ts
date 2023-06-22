import { Module } from "../interfaces";
import { syncEphemeralChannelMessages } from "./ephemeral-channel";
import { ephemeralChannelMessageCache } from "./ephemeral-channel/cache";

export const ephemeralChannel: Module = {
    name: "ephemeralChannel",
    run: async (client) => {
        await syncEphemeralChannelMessages(client)
            .then(() => {
                const cache = ephemeralChannelMessageCache.getCache();
                if(!cache.size) return;

                const messages = cache.reduce((acc, messages) => acc + messages.length, 0);
                if(!messages) return;
                
                console.log(`Detected ${messages} ephemeral channel messages out of sync with database.`);
            });
    }
}   
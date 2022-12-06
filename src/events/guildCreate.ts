import { Event } from "../interfaces/Event";
import { createGuild } from "../modules/guild/";
import { sendMissingDefaultChannelMessage } from "../modules/messages/";
import { updatePresence } from "../modules/presence/";

export const guildCreate: Event = {
    name: "guildCreate",
    run: async (client, guild) => {
        await createGuild(guild);
        await sendMissingDefaultChannelMessage(client, guild);
        await updatePresence(client);
    }
}
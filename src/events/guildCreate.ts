import { Event } from "../interfaces/Event";
import { createGuild } from "../modules/guild/";
import { sendConfigMessage } from "../modules/messages/";
import { updatePresence } from "../modules/presence/";

export const guildCreate: Event = {
    name: "guildCreate",
    run: async (client, guild) => {
        await createGuild(guild);
        await sendConfigMessage(client, guild);
        await updatePresence(client);
    }
}
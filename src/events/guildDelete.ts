import { Event } from "../interfaces/Event";
import { deleteGuild } from "../modules/guild";
import { updatePresence } from "../modules/presence/";

export const guildDelete: Event = {
    name: "guildDelete",
    run: async (client, guild) => {
        await deleteGuild(guild);
        await updatePresence(client);
    }
}
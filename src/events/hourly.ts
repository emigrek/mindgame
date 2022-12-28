import { Event } from "../interfaces";
import { updatePresence } from "../modules/presence/index";

export const daily: Event = {
    name: "daily",
    run: async (client) => {
        await updatePresence(client);
    }
}
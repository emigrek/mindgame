import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { updatePresence } from "@/modules/presence/index";

export const quarter: Event = {
    name: "quarter",
    run: async (client: ExtendedClient) => {
        await updatePresence(client);
    }
}
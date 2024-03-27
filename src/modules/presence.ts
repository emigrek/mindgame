import {Module} from "@/interfaces";
import {updatePresence} from "@/modules/presence/index";

export const presence: Module = {
    name: "presence",
    run: async (client) => {
        await updatePresence(client);
    }
}   
import {Event} from "@/interfaces";
import {updatePresence} from "@/modules/presence";

export const quarter: Event<"quarter"> = {
    name: "quarter",
    run: async (client) => {
        await updatePresence(client);
    }
}
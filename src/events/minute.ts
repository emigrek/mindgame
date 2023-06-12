import { Event } from "../interfaces";
import { deleteCachedMessages } from "../modules/ephemeral-channel";

export const minute: Event = {
    name: "minute",
    run: async (client) => {
        await deleteCachedMessages();
    }
}
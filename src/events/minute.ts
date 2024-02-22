import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { deleteCachedMessages } from "@/modules/ephemeral-channel";

export const minute: Event = {
    name: "minute",
    run: async (client: ExtendedClient) => {
        await deleteCachedMessages();
        await client.expUpdater.update();
    }
}
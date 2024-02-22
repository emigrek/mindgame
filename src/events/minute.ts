import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { deleteCachedMessages } from "@/modules/ephemeral-channel";
import { ExpUpdater } from "@/modules/experience";

export const minute: Event = {
    name: "minute",
    run: async (client: ExtendedClient) => {
        await deleteCachedMessages();
        await new ExpUpdater({client}).update();
    }
}
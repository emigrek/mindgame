import {Module} from "@/interfaces";
import {syncALlEphemeralChannelsMessages} from "@/modules/ephemeral-channel";

export const ephemeralChannel: Module = {
    name: "ephemeralChannel",
    run: async (client) => {
        await syncALlEphemeralChannelsMessages(client);
    }
}   
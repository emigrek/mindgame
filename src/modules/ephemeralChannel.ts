import { Module } from "../interfaces";
import { syncEphemeralChannelMessages } from "./ephemeral-channel";

export const ephemeralChannel: Module = {
    name: "ephemeralChannel",
    run: async (client) => {
        await syncEphemeralChannelMessages(client);
    }
}   
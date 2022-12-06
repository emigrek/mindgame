import { Module } from "../interfaces/Module";
import { updatePresence } from "./presence/";

export const presence: Module = {
    name: "presence",
    run: async (client) => {
        await updatePresence(client);
    }
}   
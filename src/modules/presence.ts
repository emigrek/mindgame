import { Module } from "../interfaces";

export const presence: Module = {
    name: "presence",
    run: async (client) => {
        console.log("[Presence] Loaded presence module");
    }
}   
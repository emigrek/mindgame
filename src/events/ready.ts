import { Event } from "../interfaces/Event";

export const ready: Event = {
    name: "ready",
    run: async (client) => {
        console.log(`[ready] Logged in as ${client.user?.tag}`);
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";

export const ready: Event = {
    name: 'ready',
    run: async (client: ExtendedClient) => {
        await client.loadModules();

        console.log(`Logged in as ${client.user?.username} 🌌`);
    }
}
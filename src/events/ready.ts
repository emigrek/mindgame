import { Event } from "@/interfaces";

export const ready: Event = {
    name: "ready",
    run: async (client) => {
        await client.loadModules();
        
        console.log(`Logged in as ${client.user?.username} 🌌`);
    }
}
import ExtendedClient from "../client/ExtendedClient";
import { Event } from "../interfaces/Event";
import { REST, Routes } from 'discord.js';

const putCommands = async (client: ExtendedClient) => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: client.commands.map(command => command.data.toJSON()) },
    );
}
export const ready: Event = {
    name: "ready",
    run: async (client) => {
        console.log(`[ready] Logged in as`, client.user?.tag);
        console.log(`[ready] Serving`, client.guilds.cache.size, `guilds`);
    }
}
import ExtendedClient from "../client/ExtendedClient";
import { Event } from "../interfaces";
import { REST, Routes, TextChannel } from 'discord.js';
import { updatePresence } from "../modules/presence/";

import config from "../utils/config";

const putCommands = async (client: ExtendedClient) => {
    const rest = new REST({ version: '10' }).setToken(config.token);
    await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: client.commands.map(command => command.data.toJSON()) },
    );
}

export const ready: Event = {
    name: "ready",
    run: async (client) => {
        console.log(`[ready] Logged in as`, client.user?.tag);
        console.log(`[ready] Serving`, client.guilds.cache.size, `guilds`);

        await updatePresence(client);
    }
}
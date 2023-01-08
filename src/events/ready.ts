import ExtendedClient from "../client/ExtendedClient";
import { Event, User } from "../interfaces";
import { REST, RESTPostAPIApplicationCommandsJSONBody, Routes, TextChannel } from 'discord.js';
import { updatePresence } from "../modules/presence/";

import config from "../utils/config";
import { getUser } from "../modules/user";
import { Document } from "mongoose";

const restPutRes = async (client: ExtendedClient) => {
    const rest = new REST({ version: '10' }).setToken(config.token);
    const commandsData = client.commands.map(command => command.data.toJSON()) as RESTPostAPIApplicationCommandsJSONBody[];;
    const contextsData = client.contexts.map(context => context.data.toJSON()) as RESTPostAPIApplicationCommandsJSONBody[];;
    const data = commandsData.concat(contextsData) as RESTPostAPIApplicationCommandsJSONBody[];
    
    await rest.put(
        Routes.applicationCommands(config.clientId),
        { 
            body: data
        },
    );
}


export const ready: Event = {
    name: "ready",
    run: async (client) => {
        console.log(`[ready] Logged in as`, client.user?.tag);
        console.log(`[ready] Serving`, client.guilds.cache.size, `guilds`);
        
        await updatePresence(client);
        //await restPutRes(client);
    }
}
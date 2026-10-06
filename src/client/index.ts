import ExtendedClient from './ExtendedClient';
import {GatewayIntentBits, Partials} from "discord.js";
import logs from "discord-logs";
import mongoose from "mongoose";

const client = new ExtendedClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.Reaction,
        Partials.Message
    ]
});

logs(client);
client.init();

// docker stop sends SIGTERM: close the gateway and Mongo cleanly instead of being killed after the timeout
const shutdown = async (signal: string) => {
    console.log(`[Process] ${signal} received, shutting down`);
    await client.destroy();
    await mongoose.disconnect();
    process.exit(0);
};
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

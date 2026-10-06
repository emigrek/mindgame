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

// Without it no voice event (join, leave, deaf, streaming) ever fires
logs(client).catch(e => {
    console.error("[discord-logs] Error", e);
    process.exit(1);
});
// e.g. putSlashCommands failing before login: exit instead of idling without a gateway connection
client.init().catch(e => {
    console.error("[Init] Error", e);
    process.exit(1);
});

// docker stop sends SIGTERM: close the gateway and Mongo cleanly instead of being killed after the timeout
const shutdown = async (signal: string) => {
    console.log(`[Process] ${signal} received, shutting down`);
    await client.destroy();
    await mongoose.disconnect();
    process.exit(0);
};
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

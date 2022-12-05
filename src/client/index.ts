import ExtendedClient from './ExtendedClient';
import { GatewayIntentBits } from "discord.js";
import logs from "discord-logs";

const client = new ExtendedClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ]
});

logs(client);

client.init();
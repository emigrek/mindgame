import ExtendedClient from './ExtendedClient';
import {GatewayIntentBits, Partials} from "discord.js";
import logs from "discord-logs";

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
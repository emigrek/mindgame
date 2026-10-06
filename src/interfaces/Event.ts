import Client from "@/client/ExtendedClient";
import type { ClientEvents } from "discord.js";
import "./ClientEvents";

// Arguments come from ClientEvents (discord.js, plus ./ClientEvents for discord-logs and the bot's own events)
export interface Event<K extends keyof ClientEvents> {
    name: K;
    run: (client: Client, ...args: ClientEvents[K]) => Promise<unknown>;
}

// Any event: the registry holds handlers of different events
export type AnyEvent = { [K in keyof ClientEvents]: Event<K> }[keyof ClientEvents];

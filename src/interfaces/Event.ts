import Client from "../client/ExtendedClient";
import { ClientEvents } from "discord.js";

interface Run {
    (client: Client, ...args: any[]): Promise<void>;
}

export interface Event {
    name: keyof ClientEvents;
    run: Run;
}
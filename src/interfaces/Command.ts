import { ChatInputCommandInteraction } from "discord.js";
import Client from "@/client/ExtendedClient";

interface Run {
    (client: Client, interaction: ChatInputCommandInteraction, ...args: any[]): Promise<void>;
}

export interface Options {
    ownerOnly?: boolean;
    level?: number;
}

export interface Command {
    data: any;
    options?: Options;
    execute: Run;
}
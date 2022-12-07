import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: CommandInteraction, ...args: any[]): Promise<void>;
}

export interface Command {
    data: SlashCommandBuilder;
    execute: Run;
}
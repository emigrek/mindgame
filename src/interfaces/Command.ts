import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: ChatInputCommandInteraction, ...args: any[]): Promise<void>;
}

interface Options {
    ownerOnly?: boolean;
}

export interface Command {
    data: any;
    options?: Options;
    execute: Run;
}
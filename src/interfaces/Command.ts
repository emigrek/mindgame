import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: ChatInputCommandInteraction, ...args: any[]): Promise<void>;
}

export interface Command {
    data: SlashCommandBuilder|SlashCommandSubcommandBuilder|SlashCommandSubcommandsOnlyBuilder;
    execute: Run;
}
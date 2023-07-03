import ExtendedClient from "@/client/ExtendedClient";
import { ContextMenuCommandInteraction, UserContextMenuCommandInteraction, ContextMenuCommandBuilder } from "discord.js";
import { Options } from "./Command";

interface Run {
    (client: ExtendedClient, interaction: ContextMenuCommandInteraction | UserContextMenuCommandInteraction | ContextMenuCommandInteraction, ...args: any[]): Promise<void>;
}

export interface ContextMenu {
    data: ContextMenuCommandBuilder;
    options?: Options;
    run: Run;
}
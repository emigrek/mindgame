import ExtendedClient from "@/client/ExtendedClient";
import {ContextMenuCommandBuilder, ContextMenuCommandInteraction, UserContextMenuCommandInteraction} from "discord.js";
import {Options} from "./Command";

interface Run {
    (client: ExtendedClient, interaction: ContextMenuCommandInteraction | UserContextMenuCommandInteraction, ...args: any[]): Promise<void>;
}

export interface ContextMenu {
    data: ContextMenuCommandBuilder;
    options?: Options;
    run: Run;
}
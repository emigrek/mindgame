import ExtendedClient from "../client/ExtendedClient";
import { ContextMenuCommandInteraction, UserContextMenuCommandInteraction, ContextMenuCommandBuilder } from "discord.js";

interface Run {
    (client: ExtendedClient, interaction: ContextMenuCommandInteraction | UserContextMenuCommandInteraction | ContextMenuCommandInteraction, ...args: any[]): Promise<void>;
}

export interface ContextMenu {
    data: ContextMenuCommandBuilder;
    run: Run;
};
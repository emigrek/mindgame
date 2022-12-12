import { AnySelectMenuInteraction } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: AnySelectMenuInteraction, ...args: any[]): Promise<void>;
}

export interface Select {
    customId: string;
    permissions?: bigint[];
    run: Run;
}
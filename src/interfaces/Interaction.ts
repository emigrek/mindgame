import { BaseInteraction } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: BaseInteraction, ...args: any[]): Promise<void>;
}

export interface Interaction {
    customId: string;
    run: Run;
}
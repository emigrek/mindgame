import { ButtonInteraction } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: ButtonInteraction, ...args: any[]): Promise<void>;
}

export interface Button {
    customId: string;
    permissions?: bigint[];
    run: Run;
}
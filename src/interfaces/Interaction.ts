import { BaseInteraction, ButtonInteraction, PermissionsBitField } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: BaseInteraction | ButtonInteraction, ...args: any[]): Promise<void>;
}

export interface Interaction {
    customId: string;
    permissions?: bigint[];
    run: Run;
}
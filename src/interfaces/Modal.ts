import { ModalSubmitInteraction } from "discord.js";
import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, interaction: ModalSubmitInteraction, ...args: any[]): Promise<void>;
}

export interface Modal {
    customId: string;
    run: Run;
}
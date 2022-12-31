import { TextChannel } from "discord.js";
import { Event } from "../interfaces";
import { attachQuickButtons } from "../modules/messages"

export const messageCreate: Event = {
    name: "messageCreate",
    run: async (client, message) => {
        if(message.author.id !== client.user?.id) return;

        await attachQuickButtons(client, message.channel as TextChannel);
    }
}
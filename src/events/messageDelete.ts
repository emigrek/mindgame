import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getEphemeralChannel } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";
import { deleteMessage } from "@/modules/messages"
import { Message } from "discord.js";

export const messageDelete: Event = {
    name: "messageDelete",
    run: async (client: ExtendedClient, message: Message) => {
        await deleteMessage(message.id);

        const ephemeralChannel = await getEphemeralChannel(message.channel.id);
        if(ephemeralChannel) {
            ephemeralChannelMessageCache.remove(message.channel.id, message.id);
        }
    }
}
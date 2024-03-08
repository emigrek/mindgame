import { Message, TextChannel } from "discord.js";
import { Event } from "@/interfaces";
import { attachQuickButtons } from "@/modules/messages"
import { getEphemeralChannel, isMessageCacheable } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";
import ExtendedClient from "@/client/ExtendedClient";
import { delay } from "@/utils/delay";

export const messageCreate: Event = {
    name: "messageCreate",
    run: async (client: ExtendedClient, message: Message) => {
        const ephemeralChannel = await getEphemeralChannel(message.channel.id);
        if(ephemeralChannel) {
            const cachable = await isMessageCacheable(message);
            cachable && ephemeralChannelMessageCache.add(message.channel.id, message);
        }

        if(message.author.id === client.user?.id) {
            delay(500).then(() => attachQuickButtons(client, message.channel as TextChannel));
        }
    }
}
import { TextChannel } from "discord.js";
import { Event } from "../interfaces";
import { attachQuickButtons } from "../modules/messages"
import { getEphemeralChannel } from "../modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "../modules/ephemeral-channel/cache";

export const messageCreate: Event = {
    name: "messageCreate",
    run: async (client, message) => {
        if(message.author.id === client.user?.id)
            await attachQuickButtons(client, message.channel as TextChannel);

        const ephemeralChannel = await getEphemeralChannel(message.channel.id);
        if(ephemeralChannel) {
            ephemeralChannelMessageCache.add(message.channel.id, message);
        }
    }
}
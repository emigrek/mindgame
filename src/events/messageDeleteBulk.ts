import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {getEphemeralChannel} from "@/modules/ephemeral-channel";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";
import {deleteMessage} from "@/modules/messages"
import {Collection, GuildTextBasedChannel, Message, Snowflake} from "discord.js";

export const messageDeleteBulk: Event = {
    name: "messageDeleteBulk",
    run: async (client: ExtendedClient, messages: Collection<Snowflake, Message>, channel: GuildTextBasedChannel) => {
        await Promise.all(
            messages.map(async (message) => {
                await deleteMessage(message.id);

                const ephemeralChannel = await getEphemeralChannel(channel.id);
                if (ephemeralChannel) {
                    ephemeralChannelMessageCache.remove(message.channel.id, message.id);
                }
            })
        );
    }
}
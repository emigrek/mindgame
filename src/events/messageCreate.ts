import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getEphemeralChannel, isMessageCacheable } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";
import { attachQuickButtons } from "@/modules/messages";
import { updateUserGuildStatistics } from "@/modules/user-guild-statistics";
import { delay } from "@/utils/delay";
import { Message, TextChannel } from "discord.js";

export const messageCreate: Event = {
    name: "messageCreate",
    run: async (client: ExtendedClient, message: Message) => {
        if (!message.guild) return;

        if (!message.author.bot) {
            await updateUserGuildStatistics({
                client,
                userId: message.author.id,
                guildId: message.guild.id,
                update: {
                    messages: 1
                }
            });
        }

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
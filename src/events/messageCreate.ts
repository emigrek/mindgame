import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {getEphemeralChannel, isMessageCacheable} from "@/modules/ephemeral-channel";
import {ephemeralChannelMessageCache} from "@/modules/ephemeral-channel/cache";
import {updateUserGuildStatistics} from "@/modules/user-guild-statistics";
import {config} from "@/config";
import {Message} from "discord.js";
import {ExperienceCalculator} from "@/modules/experience";

export const messageCreate: Event = {
    name: "messageCreate",
    run: async (client: ExtendedClient, message: Message) => {
        if (!message.guild) return;

        if (config.experience.message.enabled && !message.author.bot) {
            await updateUserGuildStatistics({
                client,
                userId: message.author.id,
                guildId: message.guild.id,
                update: {
                    messages: 1,
                    exp: ExperienceCalculator.getMessageReward(!!message.attachments.size)
                }
            });
        }

        const ephemeralChannel = await getEphemeralChannel(message.channel.id);
        if(ephemeralChannel) {
            const cacheable = await isMessageCacheable(ephemeralChannel, message);
            cacheable && ephemeralChannelMessageCache.add(message.channel.id, message);
        }
    }
}
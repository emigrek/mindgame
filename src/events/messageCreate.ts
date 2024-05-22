import ExtendedClient from "@/client/ExtendedClient";
import { config } from "@/config";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { DJ } from "@/modules/achievement/achievements";
import { getEphemeralChannel, isMessageCacheable } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";
import { ExperienceCalculator } from "@/modules/experience";
import { updateUserGuildStatistics } from "@/modules/user-guild-statistics";
import { Message } from "discord.js";

export const messageCreate: Event = {
    name: "messageCreate",
    run: async (client: ExtendedClient, message: Message) => {
        if (!message.guild) return;

        if (!message.author.bot) {
            new AchievementManager({ client, userId: message.author.id, guildId: message.guild.id })
                .check(new DJ({ message }));
        }

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
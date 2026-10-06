import { config } from "@/config";
import { Event } from "@/interfaces";
import { checkDJ } from "@/modules/achievement/achievements";
import { getEphemeralChannel, isMessageCacheable } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";
import { ExperienceCalculator } from "@/modules/experience";
import { updateUserGuildStatistics } from "@/modules/user-guild-statistics";

export const messageCreate: Event<"messageCreate"> = {
    name: "messageCreate",
    run: async (client, message) => {
        if (!message.guild) return;

        // Not awaited, verification waits for the music bot to respond
        checkDJ(client, message)
            .catch(e => console.log("There was an error while checking DJ achievement: ", e));

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
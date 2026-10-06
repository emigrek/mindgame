import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { UniqueReactions } from "@/modules/achievement/achievements";
import { getEphemeralChannel, isMessageCacheable } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";

export const messageReactionAdd: Event<"messageReactionAdd"> = {
    name: "messageReactionAdd",
    run: async (client, messageReaction) => {
        const { message } = messageReaction;
        const { channel } = message;
        const m = message.partial ? await message.fetch() : message;

        const ephemeralChannel = await getEphemeralChannel(channel.id);
        if (ephemeralChannel) {
            const cacheable = await isMessageCacheable(ephemeralChannel, m);
            cacheable ? ephemeralChannelMessageCache.add(channel.id, m) : ephemeralChannelMessageCache.remove(channel.id, message.id);
        }

        if (!m.guild || m.author.bot) return;

        new AchievementManager({ client, userId: m.author.id, guildId: m.guild.id })
            .check(
                new UniqueReactions({ message: m })
            );
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { UniqueReactions } from "@/modules/achievement/achievements/uniqueReactions";
import { getEphemeralChannel, isMessageCacheable } from "@/modules/ephemeral-channel";
import { ephemeralChannelMessageCache } from "@/modules/ephemeral-channel/cache";
import { MessageReaction } from "discord.js";

export const messageReactionAdd: Event = {
    name: "messageReactionAdd",
    run: async (client: ExtendedClient, messageReaction: MessageReaction) => {
        const { message } = messageReaction;
        const { channel } = message;

        const ephemeralChannel = await getEphemeralChannel(channel.id);
        if(!ephemeralChannel) return;

        const m = message.partial ? await message.fetch() : message;
        const cacheable = await isMessageCacheable(ephemeralChannel, m);
        cacheable ? ephemeralChannelMessageCache.add(channel.id, m) : ephemeralChannelMessageCache.remove(channel.id, message.id);

        if (!m.guild) return;

        new AchievementManager({ client, userId: m.author.id, guildId: m.guild.id })
            .add(
                new UniqueReactions({ message: m })
            )
            .check();
    }
}
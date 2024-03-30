import mongoose from "mongoose";
import ephemeralChannelSchema, {EphemeralChannelDocument} from "@/modules/schemas/EphemeralChannel";
import ExtendedClient from "@/client/ExtendedClient";
import {Message, MessageReaction, TextChannel} from "discord.js";
import moment from "moment";
import {ephemeralChannelMessageCache} from "./cache";

const EphemeralChannelModel = mongoose.model("EphemeralChannel", ephemeralChannelSchema);

const createEphemeralChannel = async (guildId: string, channelId: string, timeout: number): Promise<EphemeralChannelDocument> => {
    const newEphemeralChannel = new EphemeralChannelModel({ guildId, channelId, timeout });
    await newEphemeralChannel.save();
    return newEphemeralChannel;
}

const editEphemeralChannel = async (channelId: string, timeout: number): Promise<EphemeralChannelDocument | null> => {
    const ephemeralChannel = await EphemeralChannelModel.findOne({ channelId });

    if (!ephemeralChannel) {
        return null;
    }

    ephemeralChannel.timeout = timeout;
    await ephemeralChannel.save();
    return ephemeralChannel;
}

const deleteEphemeralChannel = async (channelId: string): Promise<boolean> => {
    const ephemeralChannel = await EphemeralChannelModel.findOne({ channelId });

    if (!ephemeralChannel) {
        return false;
    }

    await ephemeralChannel.remove();
    return true;
}

const getEphemeralChannel = async (channelId: string): Promise<EphemeralChannelDocument | null> => {
    return EphemeralChannelModel.findOne({ channelId });
}

const getGuildsEphemeralChannels = async (guildId: string): Promise<EphemeralChannelDocument[]> => {
    return EphemeralChannelModel.find({ guildId });
}

const getEphemeralChannels = async (): Promise<EphemeralChannelDocument[]> => {
    return EphemeralChannelModel.find();
}

const deleteCachedMessages = async () => {
    const cache = ephemeralChannelMessageCache.getCache();

    const deletionPromises = cache.map(async (messages, channelId) => {
        const ephemeralChannel = await getEphemeralChannel(channelId);

        if (!ephemeralChannel)
            return null;
        
        const messageDeletionPromises = messages.map(async (message: Message) => {
            const now = moment();
            const created = moment(message.createdAt);

            if(now.diff(created, "minutes", true) >= ephemeralChannel.timeout) {
                await message.delete()
                    .then(() => ephemeralChannelMessageCache.remove(channelId, message.id))
            }
        });

        await Promise.all(messageDeletionPromises)
            .catch(error => console.log("Error deleting cached messages: ", error));
    });

    await Promise.all(deletionPromises)
        .catch(error => console.log("Error deleting cached messages: ", error));
}

const syncEphemeralChannelMessages = async (client: ExtendedClient) => {
    const ephemeralChannels = await getEphemeralChannels();

    const syncPromises = ephemeralChannels.map(async (ephemeralChannel: EphemeralChannelDocument) => {
        const channel = await client.channels.fetch(ephemeralChannel.channelId) as TextChannel;
        if (!channel) return null;

        const messages = await channel.messages.fetch({ limit: 50 });
        const valid = messages
            .filter((message: Message) => moment(message.createdAt).isAfter(moment(ephemeralChannel.createdAt as string)));
        
        const cachePromises = valid.map(async (message: Message) => {
            const cacheable = await isMessageCacheable(message);
            if (!cacheable) return null;

            ephemeralChannelMessageCache.add(message.channel.id, message);
        });

        await Promise.all(cachePromises)
            .catch(error => console.log("Error caching ephemeral channel messages: ", error));
    });

    await Promise.all(syncPromises)
        .catch(error => console.log("Error syncing ephemeral channel messages: ", error));
}

const isMessageCacheable = async (message: Message): Promise<boolean> => {
    const reactionUsers = await getMessageReactionsUniqueUsers(message);
    const referenceMessage = await fetchReferenceMessage(message);

    if (reactionUsers.length || message.pinned) {
        if (referenceMessage) ephemeralChannelMessageCache.remove(message.channel.id, referenceMessage.id);
        return false;
    }
    if (!referenceMessage) return true;

    const referenceMessageCacheable = await isMessageCacheable(referenceMessage);
    return referenceMessageCacheable ||
        (!referenceMessageCacheable && message.author.id === referenceMessage.author.id);
}

const fetchReferenceMessage = async (message: Message): Promise<Message | null> => {
    const reference = message.reference;
    if (!reference || !reference.messageId) return null;
    try {
        return message.channel.messages.fetch(reference.messageId);
    } catch (error) {
        console.log("Error fetching reference message: ", error);
        return null;
    }
};

const getMessageReactionsUniqueUsers = async (message: Message): Promise<string[]> => {
    const reactions = message.reactions.cache;

    const uniqueUsersPromises = reactions.map(async (reaction: MessageReaction) => {
        const reactionUsers = await reaction.users.fetch();
        return reactionUsers
            .filter((user) => user.id !== message.author.id && !user.bot)
            .map((user) => user.id);
    });

    const uniqueUsers = await Promise.all(uniqueUsersPromises)
        .catch(error => {
            console.log("Error fetching reaction users: ", error);
            return [];
        });

    return Array.from(
        new Set(uniqueUsers.flat())
    );
}

export { createEphemeralChannel, fetchReferenceMessage, editEphemeralChannel, deleteEphemeralChannel, getEphemeralChannel, getEphemeralChannels, syncEphemeralChannelMessages, deleteCachedMessages, isMessageCacheable, getGuildsEphemeralChannels };
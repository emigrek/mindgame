import mongoose from "mongoose";
import ephemeralChannelSchema, { EphemeralChannelDocument } from "../schemas/EphemeralChannel";
import ExtendedClient from "../../client/ExtendedClient";
import { Message, TextChannel } from "discord.js";
import moment from "moment";
import { ephemeralChannelMessageCache } from "./cache";

const EphemeralChannelModel = mongoose.model("EphemeralChannel", ephemeralChannelSchema);

const createEphemeralChannel = async (guildId: string, channelId: string, timeout: number) => {
    const newEphemeralChannel = new EphemeralChannelModel({ guildId, channelId, timeout });
    await newEphemeralChannel.save();
    return newEphemeralChannel;
}

const editEphemeralChannel = async (channelId: string, timeout: number) => {
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

const getEphemeralChannel = async (channelId: string): Promise<(EphemeralChannelDocument) | null> => {
    const ephemeralChannel = await EphemeralChannelModel.findOne({ channelId });
    return ephemeralChannel;
}

const getGuildsEphemeralChannels = async (guildId: string): Promise<(EphemeralChannelDocument)[]> => {
    const ephemeralChannels = await EphemeralChannelModel.find({ guildId });
    return ephemeralChannels;
}

const getEphemeralChannels = async (): Promise<(EphemeralChannelDocument)[]> => {
    const ephemeralChannels = await EphemeralChannelModel.find();
    return ephemeralChannels;
}

const deleteCachedMessages = async () => {
    const cache = ephemeralChannelMessageCache.getCache();

    for await (const [channelId, messages] of cache) {
        const ephemeralChannel = await getEphemeralChannel(channelId);

        if (!ephemeralChannel) continue;

        for await (const message of messages) {
            const now = moment();
            const created = moment(message.createdAt);

            if (now.diff(created, "minutes", true) >= ephemeralChannel.timeout) {
                try {
                    await message.delete();
                    ephemeralChannelMessageCache.remove(channelId, message.id);
                } catch (error) {
                    console.log("Error deleting cached message: ", error);
                    continue;
                }
            }
        }
    }
}

const syncEphemeralChannelMessages = async (client: ExtendedClient) => {
    const ephemeralChannels = await getEphemeralChannels();

    for await (const ephemeralChannel of ephemeralChannels) {
        try {
            const channel = await client.channels.fetch(ephemeralChannel.channelId) as TextChannel;
            if (!channel) continue;

            const messages = await channel.messages.fetch();
            const valid = messages
                .filter((message: Message) => moment(message.createdAt).isAfter(moment(ephemeralChannel.createdAt as string)));

            for await (const [, message] of valid) {
                const cacheable = await isMessageCacheable(message);

                if (!cacheable) continue;

                ephemeralChannelMessageCache.add(message.channel.id, message);
            }
        } catch (error) {
            console.log("Error syncing ephemeral channel messages: ", error);
            continue;
        }
    }

    console.log(ephemeralChannelMessageCache.getCache());
}

const isMessageCacheable = async (message: Message) => {
    const reactionUsers = await getMessageReactionsUniqueUsers(message);
    return !reactionUsers.length;
}

const getMessageReactionsUniqueUsers = async (message: Message): Promise<string[]> => {
    const reactions = message.reactions.cache;
    const users = new Set<string>();

    for await (const [, reaction] of reactions) {
        const reactionUsers = await reaction.users.fetch();

        for (const [userId, user] of reactionUsers) {
            if(userId === message.author.id || user.bot)
                continue;
            users.add(userId);
        }
    }

    return Array.from(users);
}

export { createEphemeralChannel, editEphemeralChannel, deleteEphemeralChannel, getEphemeralChannel, getEphemeralChannels, syncEphemeralChannelMessages, deleteCachedMessages, isMessageCacheable, getGuildsEphemeralChannels };
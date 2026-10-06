import ExtendedClient from "@/client/ExtendedClient";
import { EphemeralChannel } from '@/interfaces';
import ephemeralChannelSchema, { EphemeralChannelDocument } from "@/modules/schemas/EphemeralChannel";
import { Collection, DiscordAPIError, GuildTextBasedChannel, Message, MessageReaction, RESTJSONErrorCodes, TextChannel } from "discord.js";
import moment from "moment";
import mongoose from "mongoose";
import { ephemeralChannelMessageCache } from "./cache";

const EphemeralChannelModel = mongoose.model("EphemeralChannel", ephemeralChannelSchema);

// Every message, reaction and delete event asks whether its channel is ephemeral. Known IDs answer that without a query
// for ordinary channels. Loaded at startup (syncALlEphemeralChannelsMessages), kept in sync by create and delete.
// ponytail: per process, fine while the bot runs as a single process
const ephemeralChannelIds = new Set<string>();
let ephemeralChannelIdsLoaded = false;

type CreateEphemeralChannelProps = EphemeralChannel;
const createEphemeralChannel = async ({ guildId, channelId, timeout, keepMessagesWithReactions }: CreateEphemeralChannelProps): Promise<EphemeralChannelDocument> => {
    const ephemeralChannel = await EphemeralChannelModel.create({
        guildId,
        channelId,
        timeout,
        keepMessagesWithReactions
    });
    ephemeralChannelIds.add(channelId);
    return ephemeralChannel;
}

interface EditEphemeralChannelProps {
    channelId: string;
    update: Partial<EphemeralChannel>;
}

const editEphemeralChannel = async ({ channelId, update }: EditEphemeralChannelProps): Promise<EphemeralChannelDocument | null> => {
    return EphemeralChannelModel.findOneAndUpdate(
        { channelId },
        update,
        { returnDocument: "after" }
    );
}

// False when the channel wasn't ephemeral. Also drops its cached messages, which would otherwise
// be deleted without the createdAt guard if the channel became ephemeral again.
const deleteEphemeralChannel = async (channelId: string): Promise<boolean> => {
    ephemeralChannelIds.delete(channelId);
    ephemeralChannelMessageCache.removeChannel(channelId);
    return EphemeralChannelModel.findOneAndDelete({ channelId })
        .then(deleted => !!deleted)
        .catch(() => false);
}

const getEphemeralChannel = async (channelId: string): Promise<EphemeralChannelDocument | null> => {
    if (ephemeralChannelIdsLoaded && !ephemeralChannelIds.has(channelId)) return null;
    return EphemeralChannelModel.findOne({ channelId });
}

const getGuildsEphemeralChannels = async (guildId: string): Promise<EphemeralChannelDocument[]> => {
    return EphemeralChannelModel.find({ guildId });
}

const getEphemeralChannels = async (): Promise<EphemeralChannelDocument[]> => {
    return EphemeralChannelModel.find();
}

// Retrying these every minute would only burn Discord's invalid request limit (10k per 10 min, then a Cloudflare ban)
const permanentDeleteErrors = new Set<number>([
    RESTJSONErrorCodes.UnknownMessage,
    RESTJSONErrorCodes.UnknownChannel,
    RESTJSONErrorCodes.MissingAccess,
    RESTJSONErrorCodes.MissingPermissions,
]);

const deleteCachedMessages = async () => {
    const cache = ephemeralChannelMessageCache.getCache();

    const deletionPromises = cache.map(async (messages, channelId) => {
        const ephemeralChannel = await getEphemeralChannel(channelId);

        if (!ephemeralChannel)
            return null;

        const now = moment();
        const expired: Message[] = [];
        for (const message of [...messages]) {
            // Pinned after it was cached
            if (message.pinned)
                ephemeralChannelMessageCache.remove(channelId, message.id);
            else if (now.diff(moment(message.createdAt), "minutes", true) >= ephemeralChannel.timeout)
                expired.push(message);
        }
        if (!expired.length)
            return null;

        // One request per channel instead of one per message. bulkDelete skips messages older than 14 days
        // (backlog after long downtime) and needs Manage Messages, the rest goes one by one.
        const channel = expired[0].channel as GuildTextBasedChannel;
        const bulkDeleted = await channel.bulkDelete(expired, true)
            .catch(error => {
                console.log("Error bulk deleting cached messages: ", error);
                return new Collection<string, unknown>();
            });

        await Promise.all(expired.map(async (message: Message) => {
            if (!bulkDeleted.has(message.id)) {
                const deleted = await message.delete().then(() => true, error => {
                    if (error instanceof DiscordAPIError && permanentDeleteErrors.has(Number(error.code)))
                        return true;
                    console.log("Error deleting cached message: ", error);
                    return false;
                });
                // Kept in the cache only for errors worth retrying next minute
                if (!deleted) return;
            }
            ephemeralChannelMessageCache.remove(channelId, message.id);
        }));
    });

    await Promise.all(deletionPromises)
        .catch(error => console.log("Error deleting cached messages: ", error));
}

const syncALlEphemeralChannelsMessages = async (client: ExtendedClient) => {
    const ephemeralChannels = await getEphemeralChannels();
    ephemeralChannels.forEach(({ channelId }) => ephemeralChannelIds.add(channelId));
    ephemeralChannelIdsLoaded = true;
    await Promise.all(
        ephemeralChannels.map(
            (ephemeralChannel: EphemeralChannelDocument) => syncEphemeralChannelMessages(client, ephemeralChannel)
        )
    )
        .catch(error => console.log("Error syncing ephemeral channel messages: ", error));
}

// Pages back to when the channel became ephemeral; the 50 newest messages used to be all, so a restart or an edit
// lost track of older ones in busy channels and they were never deleted.
// ponytail: capped at 1000 messages per channel
const fetchMessagesSince = async (channel: TextChannel, since: Date) => {
    const messages = new Collection<string, Message>();
    let before: string | undefined;
    for (let page = 0; page < 10; page++) {
        const batch = await channel.messages.fetch({ limit: 100, before });
        batch
            .filter(message => message.createdAt > since)
            .forEach(message => messages.set(message.id, message));

        const oldest = batch.last();
        if (batch.size < 100 || !oldest || oldest.createdAt <= since) break;
        before = oldest.id;
    }
    return messages;
};

const syncEphemeralChannelMessages = async (client: ExtendedClient, ephemeralChannel: EphemeralChannelDocument) => {
    ephemeralChannelMessageCache.removeChannel(ephemeralChannel.channelId);
    // A channel deleted while the bot was offline failed the sync on every restart
    const channel = await client.channels.fetch(ephemeralChannel.channelId)
        .catch(error => {
            if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel) return undefined;
            throw error;
        });
    if (channel === undefined) {
        await deleteEphemeralChannel(ephemeralChannel.channelId);
        return null;
    }
    if (!(channel instanceof TextChannel)) return null;

    const valid = await fetchMessagesSince(channel, moment(ephemeralChannel.createdAt as string).toDate());

    const cachePromises = valid.map(async (message: Message) => {
        const cacheable = await isMessageCacheable(ephemeralChannel, message);
        if (!cacheable) return null;

        ephemeralChannelMessageCache.add(message.channel.id, message);
    });

    await Promise.all(cachePromises)
        .catch(error => console.log("Error caching ephemeral channel messages: ", error));
};

const isMessageCacheable = async (ephemeralChannel: EphemeralChannelDocument, message: Message): Promise<boolean> => {
    const keepMessagesWithReactions = ephemeralChannel.keepMessagesWithReactions;
    const reactionUsers = await getMessageReactionsUniqueUsers(message);
    const referenceMessage = await fetchReferenceMessage(message);
    const hasPollOngoing = Boolean(message.poll && moment().isBefore(message.poll.expiresAt));

    if (
        message.pinned ||
        (keepMessagesWithReactions && reactionUsers.length) ||
        hasPollOngoing
    ) {
        if (referenceMessage) ephemeralChannelMessageCache.remove(message.channel.id, referenceMessage.id);
        return false;
    }
    if (!referenceMessage) {
        return true;
    }

    const referenceMessageCacheable = await isMessageCacheable(ephemeralChannel, referenceMessage);
    return referenceMessageCacheable ||
        (!referenceMessageCacheable && message.author.id === referenceMessage.author.id);
}

const fetchReferenceMessage = async (message: Message): Promise<Message | null> => {
    const reference = message.reference;
    // Forwards and crossposts point to other channels
    if (!reference?.messageId || reference.channelId !== message.channelId) return null;
    // The parent is often gone already, it expires before its replies
    return message.channel.messages.fetch(reference.messageId).catch(() => null);
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

export { createEphemeralChannel, deleteCachedMessages, deleteEphemeralChannel, editEphemeralChannel, fetchReferenceMessage, getEphemeralChannel, getEphemeralChannels, getGuildsEphemeralChannels, getMessageReactionsUniqueUsers, isMessageCacheable, syncALlEphemeralChannelsMessages, syncEphemeralChannelMessages };


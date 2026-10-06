import { Message as MessageType, MessageTypeIds } from '@/interfaces/Message';
import messageSchema, { MessageDocument } from "@/modules/schemas/Message";
import { DiscordAPIError, Message, RESTJSONErrorCodes, TextChannel } from "discord.js";
import mongoose from "mongoose";

const messageModel = mongoose.model("Message", messageSchema);

interface CreateMessageProps {
    message: Message;
    typeId: MessageTypeIds;
    targetUserId?: string;
}

const createMessage = async ({ message, typeId, targetUserId }: CreateMessageProps) => {
    const exists = await getMessage({
        messageId: message.id,
    });
    if (exists) return exists;

    const newMessage = new messageModel({
        messageId: message.id,
        channelId: message.channel.id,
        targetUserId,
        typeId,
    });

    await newMessage.save();
    return newMessage;
};

const getMessage = async (message: Partial<MessageType>): Promise<MessageDocument | undefined> => {
    const response = await messageModel.aggregate([
        { $match: message },
        { $sort: { createdAt: -1 } },
        { $limit: 1 }
    ]);
    return response.at(0);
}

const deleteMessage = async (messageId: string) => {
    return messageModel.deleteOne({
        messageId: messageId
    })
};

// A tracked message can be deleted while the bot is offline. Drop its record so callers send a new one.
const fetchTrackedMessage = async (channel: TextChannel, messageId: string) => {
    const message = await channel.messages.fetch(messageId)
        .catch(e => {
            if (e instanceof DiscordAPIError && e.code === RESTJSONErrorCodes.UnknownMessage) return null;
            throw e;
        });
    if (!message) await deleteMessage(messageId);
    return message;
};

const deleteMessages = async (channelId: string) => {
    return messageModel.deleteMany({
        channelId: channelId
    });
}

export { createMessage, getMessage, deleteMessage, fetchTrackedMessage, deleteMessages };

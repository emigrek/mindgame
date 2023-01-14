import { Schema } from 'mongoose';
import { Message } from '../../interfaces';

const reqString = { type: String, required: true };

const messageSchema = new Schema<Message>({
    messageId: reqString,
    channelId: reqString,
    targetUserId: { type: String, default: null },
    name: { type: String, default: null }
});

export default messageSchema;
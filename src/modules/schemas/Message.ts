import {Document, Schema} from 'mongoose';
import {Message} from '@/interfaces';

export type MessageDocument = Message & Document;

const reqString = { type: String, required: true };
const reqNumber = { type: Number, required: true };

const messageSchema = new Schema<Message>({
    messageId: reqString,
    channelId: reqString,
    targetUserId: { type: String, default: null },
    typeId: reqNumber,
});

export default messageSchema;
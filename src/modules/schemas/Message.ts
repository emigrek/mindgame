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
}, {
    // getMessage sorts by createdAt to find the latest tracked message
    timestamps: true
});

messageSchema.index({ channelId: 1, typeId: 1, targetUserId: 1 });
messageSchema.index({ messageId: 1 });

export default messageSchema;
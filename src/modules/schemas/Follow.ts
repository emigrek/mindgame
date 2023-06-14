import { Schema, Document } from 'mongoose';
import { Follow } from '../../interfaces/Follow';

export type FollowDocument = Follow & Document;

const followSchema = new Schema<Follow>({
    sourceUserId: { type: String, required: true },
    targetUserId: { type: String, required: true }
});

export default followSchema;
import { Schema, Document } from 'mongoose';
import { Follow } from '@/interfaces';

export type FollowDocument = Follow & Document;

const followSchema = new Schema<Follow>({
    sourceUserId: { type: String, required: true },
    targetUserId: { type: String, required: true }
});

followSchema.index({ sourceUserId: 1, targetUserId: 1 }, { unique: true });
followSchema.index({ targetUserId: 1 });

export default followSchema;
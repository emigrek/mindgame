import { Schema } from 'mongoose';
import { Follow } from '../../interfaces/Follow';

const followSchema = new Schema<Follow>({
    sourceUserId: { type: String, required: true },
    targetUserId: { type: String, required: true }
});

export default followSchema;
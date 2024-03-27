import {User} from '@/interfaces';
import {Document, Schema, SchemaTimestampsConfig} from 'mongoose';

export type UserDocument = User & Document & SchemaTimestampsConfig;

const reqString = { type: String, required: true };

const userSchema = new Schema<User>({
  userId: reqString,
  username: reqString,
  avatarUrl: reqString,
  publicTimeStatistics: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default userSchema;
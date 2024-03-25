import { User } from '@/interfaces';
import { Document, Schema, SchemaTimestampsConfig } from 'mongoose';

export type UserDocument = User & Document & SchemaTimestampsConfig;

const reqString = { type: String, required: true };

const Statistics = {
  exp: { type: Number, default: 0 },
  time: {
    public: { type: Boolean, default: false },
    voice: { type: Number, default: 0 },
    presence: { type: Number, default: 0 }
  },
  games: {
    won: {
      skill: { type: Number, default: 0 },
      skin: { type: Number, default: 0 }
    }
  }
}

const ExtendedStatistics = {
  level: { type: Number, default: 0 },
  commands: { type: Number, default: 0 },
  ...Statistics
};

const userSchema = new Schema<User>({
  userId: reqString,
  username: reqString,
  avatarUrl: reqString,
  stats: ExtendedStatistics,
  day: Statistics,
  week: Statistics,
  month: Statistics,
  publicTimeStatistics: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default userSchema;
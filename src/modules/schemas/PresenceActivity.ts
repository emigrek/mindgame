import { Schema, SchemaTimestampsConfig, Document } from 'mongoose';
import { PresenceActivity } from '@/interfaces';

export type PresenceActivityDocument = PresenceActivity & Document & SchemaTimestampsConfig;

const presenceActivitySchema = new Schema<PresenceActivity>({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: false, default: null },
    status: { type: String },
    client: { type: String }
}, {
    timestamps: true
});

export default presenceActivitySchema;
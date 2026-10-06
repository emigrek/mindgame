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

// One open session per member and guild; check-then-insert used to open duplicates that earned EXP forever.
// Lookups by {to: null} can't use this partial index (null also matches a missing field), hence the plain one below.
presenceActivitySchema.index({ userId: 1, guildId: 1 }, { unique: true, partialFilterExpression: { to: { $type: "null" } } });
presenceActivitySchema.index({ userId: 1, guildId: 1, to: 1 });
presenceActivitySchema.index({ to: 1 });
presenceActivitySchema.index({ userId: 1, from: -1 });

export default presenceActivitySchema;
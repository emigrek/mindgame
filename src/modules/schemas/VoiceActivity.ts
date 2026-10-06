import { Schema, Document, SchemaTimestampsConfig } from 'mongoose';
import { VoiceActivity } from '@/interfaces';

export type VoiceActivityDocument = VoiceActivity & Document & SchemaTimestampsConfig;

const reqString = { type: String, required: true };

const voiceActivitySchema = new Schema<VoiceActivity>({
    userId: reqString,
    channelId: reqString,
    voiceStateId: reqString,
    guildId: reqString,
    streaming: { type: Boolean, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: false, default: null }
}, {
    timestamps: true
});

// One open session per member and guild; check-then-insert used to open duplicates that earned EXP forever.
// Lookups by {to: null} can't use this partial index (null also matches a missing field), hence the plain one below.
voiceActivitySchema.index({ userId: 1, guildId: 1 }, { unique: true, partialFilterExpression: { to: { $type: "null" } } });
voiceActivitySchema.index({ userId: 1, guildId: 1, to: 1 });
voiceActivitySchema.index({ to: 1 });
voiceActivitySchema.index({ userId: 1, guildId: 1, from: -1 });
voiceActivitySchema.index({ userId: 1, to: -1 });
voiceActivitySchema.index({ guildId: 1, channelId: 1, to: 1 });
voiceActivitySchema.index({ guildId: 1, from: -1 });

export default voiceActivitySchema;
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

export default voiceActivitySchema;
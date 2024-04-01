import {Document, Schema, SchemaTimestampsConfig} from 'mongoose';
import {EphemeralChannel} from '@/interfaces';

export type EphemeralChannelDocument = EphemeralChannel & Document & SchemaTimestampsConfig;

const ephemeralChannelSchema = new Schema<EphemeralChannel>({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true,
        unique: true
    },
    timeout: {
        type: Number,
        default: 15,
        required: true
    },
    keepMessagesWithReactions: {
        type: Boolean,
        default: true,
        required: true
    }
}, {
    timestamps: true
});

export default ephemeralChannelSchema;
import { Achievement } from '@/interfaces';
import { Document, Schema, SchemaTimestampsConfig } from 'mongoose';

export type AchievementDocument = Achievement & Document & SchemaTimestampsConfig;

const achievementSchema = new Schema<Achievement>({
    achievementType: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
    },
    payload: {
        type: Schema.Types.Mixed,
        required: false
    }
}, {
    timestamps: true
});

export default achievementSchema;
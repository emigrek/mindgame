import {Document, Schema, SchemaTimestampsConfig} from 'mongoose';
import {Achievement} from '@/interfaces';

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
}, {
    timestamps: true
});

export default achievementSchema;
import { Achievement, AchievementType } from '@/interfaces';
import { Document, Model, Schema, SchemaTimestampsConfig } from 'mongoose';

export interface AchievementDocument<T extends AchievementType> extends Achievement<T>, Document, SchemaTimestampsConfig {}

export type AchievementModel<T extends AchievementType> = Model<AchievementDocument<T>>;

export function createAchievementSchema<T extends AchievementType>(): Schema<AchievementDocument<T>> {
    return new Schema<AchievementDocument<T>>({
        achievementType: {
            type: Schema.Types.Mixed,
            required: true
        },
        level: {
            type: Number,
            required: true
        },
        leveledUpAt: {
            type: Date,
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
}

const achievementSchema = createAchievementSchema<AchievementType>();

export default achievementSchema;
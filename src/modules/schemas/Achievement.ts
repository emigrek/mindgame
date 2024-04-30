import { Achievement, AchievementType } from '@/interfaces';
import { Document, Model, Schema, SchemaTimestampsConfig } from 'mongoose';

// export type AchievementDocument = Achievement & Document & SchemaTimestampsConfig;
export interface AchievementDocument<T extends AchievementType> extends Achievement<T>, Document, SchemaTimestampsConfig {}

export type AchievementModel<T extends AchievementType> = Model<AchievementDocument<T>>;

// const achievementSchema = new Schema<Achievement>({
//     achievementType: {
//         type: Number,
//         required: true
//     },
//     level: {
//         type: Number,
//         required: true
//     },
//     guildId: {
//         type: String,
//         required: true
//     },
//     userId: {
//         type: String,
//         required: true,
//     },
//     payload: {
//         type: Schema.Types.Mixed,
//         required: false
//     }
// }, {
//     timestamps: true
// });

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
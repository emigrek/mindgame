import { UserGuildStatistics } from "@/interfaces/UserGuildStatistics";
import { Schema, SchemaTimestampsConfig } from "mongoose";

export type UserGuildStatisticsDocument = UserGuildStatistics & Document & SchemaTimestampsConfig;

const UserStatistics = {
    exp: {
        type: Number,
        default: 0,
        required: true
    },
    commands: {
        type: Number,
        default: 0,
        required: true
    },
    messages: {
        type: Number,
        default: 0,
        required: true
    },
    time: {
        voice: {
            type: Number,
            default: 0,
            required: true
        },
        presence: {
            type: Number,
            default: 0,
            required: true
        }
    }
};

const ExtendedUserStatistics = {
    exp: {
        type: Number,
        default: 0,
        required: true
    },
    commands: {
        type: Number,
        default: 0,
        required: true
    },
    messages: {
        type: Number,
        default: 0,
        required: true
    },
    time: {
        voice: {
            type: Number,
            default: 0,
            required: true
        },
        presence: {
            type: Number,
            default: 0,
            required: true
        }
    }
};


const userGuildStatisticsSchema = new Schema<UserGuildStatistics>({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 0,
        required: true
    },
    total: ExtendedUserStatistics,
    day: UserStatistics,
    week: UserStatistics,
    month: UserStatistics
}, {
    timestamps: true
});

export default userGuildStatisticsSchema;
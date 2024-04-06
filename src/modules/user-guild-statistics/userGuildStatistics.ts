import ExtendedClient from "@/client/ExtendedClient";
import {Sorting, SortingRanges, SortingTypes} from "@/interfaces";
import {ExtendedUserStatistics, UserGuildStatistics, UserStatistics} from "@/interfaces/UserGuildStatistics";
import userGuildStatisticsSchema from "@/modules/schemas/UserGuildStatistics";
import {expToLevel, levelToExp} from "@/modules/user";
import {merge} from "@/utils/merge";
import {Guild} from "discord.js";
import mongoose from "mongoose";

export const UserGuildStatisticsModel = mongoose.model("UserGuildStatistics", userGuildStatisticsSchema);

export interface GuildStatisticsProps {
    userId: string;
    guildId: string;
}

export const createUserGuildStatistics = async ({ userId, guildId }: GuildStatisticsProps) => {
    const newUserGuildStatistics = new UserGuildStatisticsModel({ userId, guildId });
    await newUserGuildStatistics.save();
    return newUserGuildStatistics;
};

export const getUserGuildStatistics = async ({ userId, guildId }: GuildStatisticsProps) => {
    const userGuildStatistics = await UserGuildStatisticsModel.findOne({ userId, guildId });
    if (!userGuildStatistics) return createUserGuildStatistics({ userId, guildId });
    return userGuildStatistics;
}

export const getUserStatistics = async (userId: string) => {
    return UserGuildStatisticsModel.find({ userId });
}

export const deleteUserGuildStatistics = async ({ userId, guildId }: GuildStatisticsProps) => {
    return UserGuildStatisticsModel.deleteOne({ userId, guildId });
}

export const getGuildStatistics = async (guildId: string) => {
    return UserGuildStatisticsModel.find({ guildId });
};

export interface UpdateUserGuildStatisticsProps {
    client: ExtendedClient;
    userId: string;
    guildId: string;
    update: Partial<UserStatistics>;
}

export const updateUserGuildStatistics = async ({ client, userId, guildId, update }: UpdateUserGuildStatisticsProps) => {
    const userGuildStatistics = await getUserGuildStatistics({ userId, guildId });
    let userLeveledUpDuringUpdate = false;

    userGuildStatistics.total = merge(userGuildStatistics.total, update);
    userGuildStatistics.day = merge(userGuildStatistics.day, update);
    userGuildStatistics.week = merge(userGuildStatistics.week, update);
    userGuildStatistics.month = merge(userGuildStatistics.month, update);

    if (userGuildStatistics.total.exp >= levelToExp(userGuildStatistics.level + 1))
        userLeveledUpDuringUpdate = true;

    const oldLevel = userGuildStatistics.level;
    const newLevel = expToLevel(userGuildStatistics.total.exp);

    userGuildStatistics.level = newLevel;

    await userGuildStatistics.save();

    if (userLeveledUpDuringUpdate)
        client.emit("userLeveledUp", userId, guildId, oldLevel, newLevel);
    
    return userGuildStatistics;
}

export interface GetUserGuildRank {
    userId: string;
    guildId: string;
}

export const getUserGuildRank = async ({ userId, guildId }: GetUserGuildRank) => {
    const guildStatistics = await UserGuildStatisticsModel.aggregate([
        {
            $match: { guildId }
        },
        {
            $sort: { "total.exp": -1 }
        }
    ]);
    return { 
        rank: guildStatistics.findIndex((statistics) => statistics.userId === userId) + 1, 
        total: guildStatistics.length 
    };
};

export const clearGuildExperience = async (guildId: string) => {
    return UserGuildStatisticsModel.deleteMany({ guildId });
};

export const clearExperience = async () => {
    return UserGuildStatisticsModel.deleteMany({});
};

interface GetRankingProps {
    type: Sorting;
    page: number;
    perPage: number;
    guild: Guild;
    userIds?: string[];
    targetUserId?: string;
}

export const getRanking = async ({ type, page, perPage, guild, userIds, targetUserId }: GetRankingProps) => {
    const matchFilter = {
        guildId: guild.id,
        ...(userIds?.length ? { userId: { $in: userIds } } : {}),
        ...((type.type === SortingTypes.VOICE && type.range === SortingRanges.TOTAL) ? { "user.publicTimeStatistics": true } : {})
    };

    let targetUserPosition: number | null = null;
    if (targetUserId) {
        const positionPipeline = [
            { $match: matchFilter },
            { $sort: type.sort },
            {
                $group: {
                    _id: null,
                    users: { $push: "$userId" }
                }
            },
            {
                $project: {
                    position: { $indexOfArray: ["$users", targetUserId] }
                }
            }
        ];
        const positionResult = await UserGuildStatisticsModel.aggregate(positionPipeline);
        if (positionResult.length > 0 && positionResult[0].position !== -1) {
            targetUserPosition = positionResult[0].position;
        }
    }

    let renderedPage = page;
    if (targetUserPosition !== null) {
        renderedPage = Math.ceil((targetUserPosition + 1) / perPage);
    }

    const resultsPipeline = [
        { $match: matchFilter },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "userId",
                as: "user"
            }
        },
        { $unwind: "$user" },
        { $sort: type.sort },
        { $skip: (renderedPage - 1) * perPage },
        { $limit: perPage },
    ];
    const results = await UserGuildStatisticsModel.aggregate(resultsPipeline);

    const totalCount = await UserGuildStatisticsModel.countDocuments(matchFilter);
    const pagesCount = Math.ceil(totalCount / perPage);

    return {
        renderedPage,
        onPage: results,
        pagesCount
    };
};

export const clearTemporaryStatistics = async (type: 'day' | 'week' | 'month') => {
    return UserGuildStatisticsModel.updateMany({}, {
        [`${type}`]: {
            exp: 0,
            commands: 0,
            messages: 0,
            time: {
                voice: 0,
                presence: 0,
            }
        }
    });
};

export const getExperiencePercentage = async (userGuildStatistics: UserGuildStatistics) => {
    const expToCurrentLevel = levelToExp(userGuildStatistics.level);
    const expToLevelUp = levelToExp(userGuildStatistics.level + 1);
    return (((userGuildStatistics.total.exp-expToCurrentLevel)/(expToLevelUp-expToCurrentLevel))*100).toFixed(2);
};

export const getUserTotalStatistics = async (userId: string): Promise<ExtendedUserStatistics> => {
    const userGuildStatistics = await UserGuildStatisticsModel.find({ userId });

    return userGuildStatistics.reduce((acc, statistics) => {
        acc = merge(acc, statistics.total);
        return acc;
    }, {
        exp: 0,
        commands: 0,
        messages: 0,
        time: {
            voice: 0,
            presence: 0,
        }
    });
}
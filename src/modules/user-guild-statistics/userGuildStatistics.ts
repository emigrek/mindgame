import ExtendedClient from "@/client/ExtendedClient";
import {Sorting, SortingRanges, SortingTypes} from "@/interfaces";
import {ExtendedUserStatistics, UserGuildStatistics, UserStatistics} from "@/interfaces/UserGuildStatistics";
import userGuildStatisticsSchema, {UserIncludedGuildStatisticsDocument} from "@/modules/schemas/UserGuildStatistics";
import {expToLevel, levelToExp} from "@/modules/user";
import {merge} from "@/utils/merge";
import {Guild} from "discord.js";
import mongoose, {PipelineStage} from "mongoose";
import {rankingStore} from "@/stores/rankingStore";
import {getSortingByType} from "@/modules/user-guild-statistics/sortings";

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

    const oldLevel = userGuildStatistics.level;
    const expToNext = levelToExp(oldLevel + 1);

    if (userGuildStatistics.total.exp > expToNext)
        userLeveledUpDuringUpdate = true;

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

// Counts instead of loading the whole guild to find one position
export const getUserGuildRank = async ({ userId, guildId }: GetUserGuildRank) => {
    const statistics = await UserGuildStatisticsModel.findOne({ userId, guildId }, { "total.exp": 1 }).lean();
    const [higher, total] = await Promise.all([
        UserGuildStatisticsModel.countDocuments({ guildId, "total.exp": { $gt: statistics?.total.exp ?? 0 } }),
        UserGuildStatisticsModel.countDocuments({ guildId }),
    ]);
    return {
        rank: statistics ? higher + 1 : 0,
        total
    };
};

export const clearGuildExperience = async (guildId: string) => {
    return UserGuildStatisticsModel.deleteMany({ guildId });
};

export const clearExperience = async () => {
    return UserGuildStatisticsModel.deleteMany({});
};

interface GetRankingProps {
    sourceUserId: string;
    guild: Guild;
}

interface GetRankingResponse {
    metadata: {
        total: number;
        page: number;
        perPage: number;
    };
    data: UserIncludedGuildStatisticsDocument[];
}

// Filters by guild before joining users; the $lookup used to run for every document of every guild
const getRankingPipeline = (guildId: string, userIds: string[], type: Sorting): PipelineStage[] => {
    // _id breaks ties, so pages of equal values (e.g. zeros right after a daily reset) don't shuffle between clicks
    const sort = { ...type.sort, _id: 1 } as Record<string, 1 | -1>;
    return [
        { $match: { guildId, ...(userIds?.length ? { userId: { $in: userIds } } : {}) } }, // Compare users
        { $lookup: { from: "users", localField: "userId", foreignField: "userId", as: "user" } },
        { $unwind: "$user" },
        // Support private time statistics
        ...((type.type === SortingTypes.VOICE && type.range === SortingRanges.TOTAL) ? [{ $match: { "user.publicTimeStatistics": true } }] : []),
        { $sort: sort },
        { $setWindowFields: { partitionBy: null, sortBy: sort, output: { position: { $documentNumber: {} } } } },
    ];
};

export const getRanking = async ({ sourceUserId, guild }: GetRankingProps): Promise<GetRankingResponse> => {
    const { page, userIds, perPage, sorting, range } = rankingStore.get(sourceUserId);
    const type = getSortingByType(sorting, range);

    const results = await UserGuildStatisticsModel.aggregate([
        ...getRankingPipeline(guild.id, userIds, type),
        {
            $facet: {
                metadata: [
                    { $count: "total" },
                    {
                        $addFields: {
                            totalPages: { $ceil: { $divide: ["$total", perPage] } }
                        }
                    }
                ],
                // Page buttons on an older message can push the stored page below 1
                data: [{ $skip: Math.max(0, (page - 1) * perPage) }, { $limit: perPage }]
            }
        },
    ]);

    const total = results[0].metadata[0]?.totalPages || 0;
    rankingStore.get(sourceUserId).pagesCount = total;

    return {
        metadata: {
            total,
            page,
            perPage
        },
        data: results[0].data
    };
};

interface FindUserRankingPageProps {
    sourceUserId: string;
    targetUserId: string;
    guild: Guild;
}

export const findUserRankingPage = async ({ sourceUserId, targetUserId, guild }: FindUserRankingPageProps) => {
    const { perPage, sorting, range, userIds } = rankingStore.get(sourceUserId);
    const type = getSortingByType(sorting, range);

    const userStatistics = await UserGuildStatisticsModel.aggregate([
        ...getRankingPipeline(guild.id, userIds, type),
        { $project: { userId: 1 } },
    ]);

    const userPosition = userStatistics.findIndex((statistics) => statistics.userId === targetUserId);
    if (userPosition === -1) return 1;
    return Math.ceil((userPosition + 1) / perPage);
}

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
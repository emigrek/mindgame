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

// Reads never insert: viewing the profile of someone who left used to put them back into the ranking.
// A missing document reads as an unsaved one with default (zero) values.
export const getUserGuildStatistics = async ({ userId, guildId }: GuildStatisticsProps) => {
    return await UserGuildStatisticsModel.findOne({ userId, guildId }) ?? new UserGuildStatisticsModel({ userId, guildId });
}

export const deleteUserGuildStatistics = async ({ userId, guildId }: GuildStatisticsProps) => {
    return UserGuildStatisticsModel.deleteOne({ userId, guildId });
}

export interface UpdateUserGuildStatisticsProps {
    client: ExtendedClient;
    userId: string;
    guildId: string;
    update: Partial<UserStatistics>;
}

// The same increments go to every bucket
const toIncrements = ({ exp, commands, messages, time }: Partial<UserStatistics>) => {
    const values = { exp, commands, messages, "time.voice": time?.voice, "time.presence": time?.presence };
    const increments: Record<string, number> = {};
    for (const bucket of ["total", "day", "week", "month"])
        for (const [path, value] of Object.entries(values))
            if (value) increments[`${bucket}.${path}`] = value;
    return increments;
};

// $inc is atomic: concurrent writers (messages, commands, rewards, the minute tick, the daily reset) used to read,
// add and save whole documents, overwriting each other's increments
export const updateUserGuildStatistics = async ({ client, userId, guildId, update }: UpdateUserGuildStatisticsProps) => {
    const increments = toIncrements(update);
    if (!Object.keys(increments).length)
        return getUserGuildStatistics({ userId, guildId });

    const userGuildStatistics = await UserGuildStatisticsModel.findOneAndUpdate(
        { userId, guildId },
        { $inc: increments },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    const oldLevel = userGuildStatistics.level;
    const newLevel = expToLevel(userGuildStatistics.total.exp);
    if (newLevel <= oldLevel)
        return userGuildStatistics;

    // Only the writer that actually moves the level announces it
    const { modifiedCount } = await UserGuildStatisticsModel.updateOne(
        { _id: userGuildStatistics._id, level: oldLevel },
        { $set: { level: newLevel } }
    );
    if (modifiedCount) {
        userGuildStatistics.level = newLevel;
        client.emit("userLeveledUp", userId, guildId, oldLevel, newLevel);
    }

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

// The yearly wipe resets experience and levels only; it used to delete every document, message and time counters included
export const clearExperience = async () => {
    return UserGuildStatisticsModel.updateMany({}, { $set: { "total.exp": 0, "day.exp": 0, "week.exp": 0, "month.exp": 0, level: 0 } });
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
        // Positions come from the page offset (getRanking): $documentNumber accepts a single sort key only,
        // so it can't follow the _id tie-break
        { $sort: sort },
    ];
};

export const getRanking = async ({ sourceUserId, guild }: GetRankingProps): Promise<GetRankingResponse> => {
    const { page, userIds, perPage, sorting, range } = rankingStore.get(sourceUserId);
    const type = getSortingByType(sorting, range);

    // Page buttons on an older message can push the stored page below 1
    const skip = Math.max(0, (page - 1) * perPage);
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
                data: [{ $skip: skip }, { $limit: perPage }]
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
        data: results[0].data.map((row: UserIncludedGuildStatisticsDocument, index: number) => ({ ...row, position: skip + index + 1 }))
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

interface OpenRankingProps {
    sourceUserId: string;
    targetUserId?: string;
    guild: Guild;
}

// Fresh ranking view on the page of the target (or the viewer). Shared by /ranking, the ranking button and both
// context menus; the four copies had drifted (/ranking kept the previous sorting, the others reset it).
export const openRanking = async ({ sourceUserId, targetUserId, guild }: OpenRankingProps) => {
    const rankingState = rankingStore.get(sourceUserId);
    rankingState.sorting = SortingTypes.EXP;
    rankingState.range = SortingRanges.TOTAL;
    rankingState.userIds = [];
    rankingState.targetUserId = targetUserId;
    rankingState.page = await findUserRankingPage({ sourceUserId, targetUserId: targetUserId ?? sourceUserId, guild });
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
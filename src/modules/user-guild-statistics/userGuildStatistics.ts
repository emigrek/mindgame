import ExtendedClient from "@/client/ExtendedClient";
import { Sorting, SortingRanges, SortingTypes } from "@/interfaces";
import { ExtendedUserStatistics, UserGuildStatistics, UserStatistics } from "@/interfaces/UserGuildStatistics";
import { UserDocument } from "@/modules/schemas/User";
import userGuildStatisticsSchema, { UserGuildStatisticsDocument } from "@/modules/schemas/UserGuildStatistics";
import { expToLevel, levelToExp } from "@/modules/user";
import { merge } from "@/utils/merge";
import { Guild } from "discord.js";
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
    const userGuildStatistics = await UserGuildStatisticsModel.find({ userId });
    return userGuildStatistics;
}

export const deleteUserGuildStatistics = async ({ userId, guildId }: GuildStatisticsProps) => {
    return UserGuildStatisticsModel.deleteOne({ userId, guildId });
}

export const getGuildStatistics = async (guildId: string) => {
    return UserGuildStatisticsModel.find({ guildId });
};

export const getAllUserGuildStatistics = async () => {
    return UserGuildStatisticsModel.find({});
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
    const guildStatistics = await getGuildStatistics(guildId);
    const sorted = guildStatistics.sort((a, b) => b.total.exp - a.total.exp);
    const rank = sorted.findIndex((statistics) => statistics.userId === userId) + 1;
    return { rank, total: guildStatistics.length };
};

export const clearGuildExperience = async (guildId: string) => {
    return UserGuildStatisticsModel.deleteMany({ guildId });
};

export const clearExperience = async () => {
    return UserGuildStatisticsModel.deleteMany({});
};

export interface UserIncludedGuildStatisticsDocument extends UserGuildStatisticsDocument {
    user: UserDocument;
}

export const getRanking = async (type: Sorting, page: number, perPage: number, guild: Guild, userIds?: string[]) => {
    const usersFilter = new Set<string>();

    if (userIds?.length) {
        userIds.forEach((userId) => usersFilter.add(userId));
    }

    if (guild && !userIds?.length) {
        const guildUserIds = guild.members.cache.map((member) => member.user.id);
        guildUserIds.forEach((userId) => {
            usersFilter.add(userId);
        });
    }
    
    const query = usersFilter.size ? {
        userId: { $in: Array.from(usersFilter) },
        guildId: guild?.id,
        ...((type.type === SortingTypes.VOICE && type.range === SortingRanges.TOTAL) ? {
            "user.publicTimeStatistics": true
        } : {})
    } : {};

    const results = await UserGuildStatisticsModel.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "userId",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $match: query,
        },
        {
            $sort: type.sort
        },
    ]) as UserIncludedGuildStatisticsDocument[];
    const pagesCount = Math.ceil((await UserGuildStatisticsModel.countDocuments(query)) / perPage) || 1;
    const onPage = results.slice((page - 1) * perPage, page * perPage);

    return {
        onPage,
        pagesCount
    }
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

export const getExperienceProcentage = async (userGuildStatistics: UserGuildStatistics) => {
    const expToCurrentLevel = levelToExp(userGuildStatistics.level);
    const expToLevelUp = levelToExp(userGuildStatistics.level + 1);
    return (((userGuildStatistics.total.exp-expToCurrentLevel)/(expToLevelUp-expToCurrentLevel))*100).toFixed(2);
};

export const getUserTotalStatistics = async (userId: string): Promise<ExtendedUserStatistics> => {
    const userGuildStatistics = await UserGuildStatisticsModel.find({ userId });

    const total = userGuildStatistics.reduce((acc, statistics) => {
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

    return total;
}
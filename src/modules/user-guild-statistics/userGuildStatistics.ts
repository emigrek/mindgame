import ExtendedClient from "@/client/ExtendedClient";
import { Sorting } from "@/interfaces";
import { UserGuildStatistics, UserStatistics } from "@/interfaces/UserGuildStatistics";
import userGuildStatisticsSchema from "@/modules/schemas/UserGuildStatistics";
import { UserModel, expToLevel, getUsers, levelToExp } from "@/modules/user";
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
    const userGuildStatistics = await getUserGuildStatistics({ userId, guildId });
    const rank = await UserGuildStatisticsModel.countDocuments({ "total.exp": { $gt: userGuildStatistics.total.exp } });
    const total = await UserGuildStatisticsModel.countDocuments();
    return { rank: rank + 1, total };
};

export interface UpdateUserGuildTimePublicProps {
    userId: string;
    guildId: string;
}

export const updateUserGuildTimePublic = async ({ userId, guildId }: UpdateUserGuildTimePublicProps) => {
    const userGuildStatistics = await getUserGuildStatistics({ userId, guildId });
    userGuildStatistics.total.time.public = !userGuildStatistics.total.time.public;
    await userGuildStatistics.save();
    return userGuildStatistics;
}

export const clearGuildExperience = async (guildId: string) => {
    return UserGuildStatisticsModel.deleteMany({ guildId });
};

export const clearExperience = async () => {
    return UserGuildStatisticsModel.deleteMany({});
};

export const getRanking = async (type: Sorting, page: number, perPage: number, guild?: Guild, userIds?: string[]) => {
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
    } : {};

    const results = await UserModel.find(query).sort(type.sort);

    const pagesCount = Math.ceil((await UserModel.countDocuments(query)) / perPage) || 1;

    const onPage = results.slice((page - 1) * perPage, page * perPage);

    return {
        onPage,
        pagesCount
    }
};

export const clearTemporaryStatistics = async (type: string) => {
    const blankTemporaryStatistic = {
        exp: 0,
        commands: 0,
        messages: 0,
        time: {
            voice: 0,
            presence: 0,
        }
    };

    const users = await getUsers();
    
    for (const user of users) {
        const userStatistics = await getUserStatistics(user.userId);

        const promises = userStatistics.map((statistics) => {
            switch (type) {
                case "day":
                    statistics.day = blankTemporaryStatistic;
                    break;
                case "week":
                    statistics.week = blankTemporaryStatistic;
                    break;
                case "month":
                    statistics.month = blankTemporaryStatistic;
                    break;
            }
            return statistics.save();
        });

        await Promise.all(promises);
    }
};

export const getExperienceProcentage = async (userGuildStatistics: UserGuildStatistics) => {
    const expToCurrentLevel = levelToExp(userGuildStatistics.level);
    const expToLevelUp = levelToExp(userGuildStatistics.level + 1);
    return (((userGuildStatistics.total.exp-expToCurrentLevel)/(expToLevelUp-expToCurrentLevel))*100).toFixed(2);
};
import mongoose, { Document, SortOrder } from "mongoose";
import { User, Guild, EmbedField, Embed } from "discord.js";
import { User as DatabaseUser, Guild as DatabaseGuild } from "../../interfaces";
import userSchema from "../schemas/User";
import { ExtendedStatistics, ExtendedStatisticsPayload, Statistics } from "../../interfaces/User";
import ExtendedClient from "../../client/ExtendedClient";

const UserModel = mongoose.model("User", userSchema);

const expConstant: number = 0.3829;
const expInflationRate: number = 1;

const root = (x: number, n: number) => {
    return Math.pow(Math.E, Math.log(x) / n);
}

const expToLevel = (exp: number) => {
    return Math.floor(
        root(exp/expInflationRate, 3) * expConstant
    );
};

const levelToExp = (level: number) => {
    return Math.floor(
        Math.pow(level/expConstant, 3) * expInflationRate
    );
};

const createUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if(exists) return exists;

    const newUser = new UserModel({
        userId: user.id,
        tag: user.tag,
        avatarUrl: user.displayAvatarURL({ extension: "png" })
    });

    await newUser.save();
    return newUser;
}

const deleteUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if(!exists) return null;

    await UserModel.deleteOne({ userId: user.id });
    return true;
}

const getUser = async (user: User) => {
    if(user.bot)
        return null;

    let exists = await UserModel.findOne({ userId: user.id });

    if(!exists) {
        exists = await createUser(user);
    }

    return exists;
}

const getUserRank = async (user: DatabaseUser) => {
    const exists = await UserModel.findOne({ userId: user.userId });
    if(!exists) return null;

    const users = await UserModel.find();
    const sorted = users.sort((a, b) => b.stats.exp - a.stats.exp);
    const rank = sorted.findIndex(u => u.userId === user.userId) + 1;

    return rank;
};

const getUsers = async () => {
    const users = await UserModel.find();
    return users;
}

const createUsers = async (guild: Guild) => {
    const members = await guild.members.fetch();
    const users = members.map(member => member.user).filter(user => !user.bot);
    const created: DatabaseUser[] = [];

    for await (const user of users) {
        const newUser = await createUser(user);
        created.push(newUser);
    }

    return created;
}

const updateUser = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if(!exists) {
        exists = await createUser(user);
    }

    await UserModel.updateOne({ userId: user.id }, {
        tag: user.tag,
        avatarUrl: user.displayAvatarURL({ extension: "png" })
    });

    return exists;
}

const setPublicTimeStats = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if(!exists) {
        exists = await createUser(user);
    }

    exists.stats.time.public = !exists.stats.time.public;

    await exists.save();
    return exists;
}

const updateUserStatistics = async (client: ExtendedClient, user: User, extendedStatisticsPayload: ExtendedStatisticsPayload, sourceGuild?: DatabaseGuild) => {
    const userSource = await updateUser(user) as DatabaseUser & mongoose.Document;
    const newExtendedStatistics: ExtendedStatistics = {
        level: userSource.stats.level + (extendedStatisticsPayload.level || 0),
        exp: userSource.stats.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.stats.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.stats.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        commands: userSource.stats.commands + (extendedStatisticsPayload.commands || 0),
        games: {
            won: {
                skill: userSource.stats.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.stats.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    };
    const day: Statistics = {
        exp: userSource.day.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.day.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.day.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        games: {
            won: {
                skill: userSource.day.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.day.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    }
    const week: Statistics = {
        exp: userSource.week.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.week.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.week.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        games: {
            won: {
                skill: userSource.week.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.week.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    }
    const month: Statistics = {
        exp: userSource.month.exp + (extendedStatisticsPayload.exp || 0),
        time: {
            public: userSource.stats.time.public || (extendedStatisticsPayload.time?.public || false),
            voice: userSource.month.time.voice + (extendedStatisticsPayload.time?.voice || 0),
            presence: userSource.month.time.presence + (extendedStatisticsPayload.time?.presence || 0)
        },
        games: {
            won: {
                skill: userSource.month.games.won.skill + (extendedStatisticsPayload.games?.won?.skill || 0),
                skin: userSource.month.games.won.skin + (extendedStatisticsPayload.games?.won?.skin || 0)
            }
        }
    }

    userSource.stats = newExtendedStatistics;
    userSource.day = day;
    userSource.week = week;
    userSource.month = month;

    let userLeveledUpDuringUpdate: boolean = false; // Flag

    if(userSource.stats.exp >= levelToExp(userSource.stats.level + 1)) // When exceed exp needed to level up
        userLeveledUpDuringUpdate = true; // Mark flag to emit event

    userSource.stats.level = expToLevel(userSource.stats.exp); // Update level

    await userSource.save();
    
    if(userLeveledUpDuringUpdate) await client.emit("userLeveledUp", user, sourceGuild); // Emiting event

    return userSource;
};

const everyUser = async (client: ExtendedClient, callback: (user: DatabaseUser & Document) => void) => {
    const users = await getUsers();
    for await (const user of users) {
        await callback(user);
    }
}

const clearExperience = async () => {
    await UserModel.updateMany({}, { $set: { "stats.exp": 0, "stats.level": 0 } });
}

type SortValues = { [key: string]: mongoose.SortOrder | { $meta: "textScore"; } };

const sortValuesByType = (type: string): SortValues => {
    switch(type) {
        case "exp":
            return { "stats.exp": -1 };
        case "time":
            return { "stats.time.voice": -1 };
        case "skill":
            return { "stats.games.won.skill": -1 };
        case "skin":
            return { "stats.games.won.skin": -1 };
        case "commands":
            return { "stats.commands": -1 };
        case "day exp":
            return { "day.exp": -1 };
        case "day voice":
            return { "day.time.voice": -1 };
        case "week exp":
            return { "week.exp": -1 };
        case "week voice":
            return { "week.time.voice": -1 };
        case "month exp":
            return { "month.exp": -1 };
        case "month voice":
            return { "month.time.voice": -1 };
        default:
            return { "stats.exp": -1 };
    }
};

const getRanking = async (client: ExtendedClient, type: string, page: number) => {
    const sorting = sortValuesByType(type);
    const users = await UserModel.find({}).sort(sorting);
    const usersOnPage = users.slice((page - 1) * 10, page * 10);
    return usersOnPage;
};

const findUserRankingPage = async (client: ExtendedClient, type: string, user: User) => {
    const sorting = sortValuesByType(type);
    const users = await UserModel.find({}).sort(sorting);
    const userIndex = users.findIndex((userSource) => userSource.userId === user.id);
    return Math.ceil((userIndex + 1) / 10);
};

const getRankingPagesCount = async (client: ExtendedClient, type: string) => {
    const sorting = sortValuesByType(type);
    const users = await UserModel.find({}).sort(sorting);
    return Math.ceil(users.length / 10);
};

const clearTemporaryStatistics = async (client: ExtendedClient, type: string) => {
    const blankTemporaryStatistic = {
        exp: 0,
        time: {
            public: false,
            voice: 0,
            presence: 0
        },
        games: {
            won: {
                skill: 0,
                skin: 0
            }
        }
    };

    everyUser(client, async (sourceUser) => {
        switch(type) {
            case "day":
                sourceUser.day = blankTemporaryStatistic;
                break;
            case "week":
                sourceUser.week = blankTemporaryStatistic;
                break;
            case "month":
                sourceUser.month = blankTemporaryStatistic;
                break;
        }
        await sourceUser.save();
    });
};

export { setPublicTimeStats, sortValuesByType, getRankingPagesCount, findUserRankingPage, getRanking, createUser, deleteUser, getUser, getUserRank, getUsers, createUsers, updateUser, updateUserStatistics, expToLevel, levelToExp, everyUser, clearTemporaryStatistics, UserModel, clearExperience };
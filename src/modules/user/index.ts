import mongoose, { Document } from "mongoose";
import { User, Guild } from "discord.js";
import { User as DatabaseUser } from "../../interfaces";
import userSchema from "../schemas/User";
import { ExtendedStatistics, ExtendedStatisticsPayload, Statistics } from "../../interfaces/User";
import ExtendedClient from "../../client/ExtendedClient";

const UserModel = mongoose.model("User", userSchema);

const expConstant: number = 0.3829;
const expInflationRate: number = 1;

const expToLevel = (exp: number) => {
    return Math.floor(
        Math.pow(expInflationRate/exp, 1/expConstant)
    );
};

const levelToExp = (level: number) => {
    return Math.floor(
        Math.pow(level, expConstant) * expInflationRate
    );
};

const createUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if(exists) return exists;

    const newUser = new UserModel({
        userId: user.id,
        tag: user.tag,
        avatarUrl: user.avatarURL()
    });

    await newUser.save();
    return newUser;
}

const deleteUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if(!exists) return new Error("User not found");

    await UserModel.deleteOne({ userId: user.id });
    return true;
}

const getUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if(!exists) return new Error("User not found");

    return exists;
}

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
        avatarUrl: user.avatarURL()
    });

    return exists;
}

const updateUserStatistics = async (client: ExtendedClient, user: User, extendedStatisticsPayload: ExtendedStatisticsPayload) => {
    const userSource = await updateUser(user) as DatabaseUser & Document;
    const newExtendedStatistics: ExtendedStatistics = {
        level: userSource.stats.level + (extendedStatisticsPayload.level ?? 0),
        exp: userSource.stats.exp + (extendedStatisticsPayload.exp ?? 0),
        time: userSource.stats.time + (extendedStatisticsPayload.time ?? 0),
        commands: userSource.stats.commands + (extendedStatisticsPayload.commands ?? 0),
        games: {
            won: {
                skill: userSource.stats.games.won.skill + (extendedStatisticsPayload.games?.won?.skill ?? 0),
                skins: userSource.stats.games.won.skins + (extendedStatisticsPayload.games?.won?.skins ?? 0)
            }
        }
    };
    const newStatistics: Statistics = {
        exp: userSource.stats.exp + (extendedStatisticsPayload.exp ?? 0),
        time: userSource.stats.time + (extendedStatisticsPayload.time ?? 0),
        games: {
            won: {
                skill: userSource.stats.games.won.skill + (extendedStatisticsPayload.games?.won?.skill ?? 0),
                skins: userSource.stats.games.won.skins + (extendedStatisticsPayload.games?.won?.skins ?? 0)
            }
        }
    }

    userSource.stats = newExtendedStatistics;
    userSource.day = newStatistics;
    userSource.week = newStatistics;
    userSource.month = newStatistics;

    let userLeveledUpDuringUpdate: boolean = false; // Flag

    if(userSource.stats.exp >= levelToExp(userSource.stats.level + 1)) // When exceed exp needed to level up
        userLeveledUpDuringUpdate = true; // Mark flag to emit event

    userSource.stats.level = expToLevel(userSource.stats.exp); // Update level
    await userSource.save();
    
    if(userLeveledUpDuringUpdate) await client.emit("userLeveledUp", userSource, user); // Emiting event

    return userSource;
};

export { createUser, deleteUser, getUser, getUsers, createUsers, updateUser, updateUserStatistics, expToLevel, levelToExp, UserModel };
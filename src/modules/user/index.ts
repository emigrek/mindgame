import mongoose from "mongoose";
import { User, Guild } from "discord.js";
import { User as DatabaseUser } from "../../interfaces";
import userSchema from "../schemas/User";

const UserModel = mongoose.model("User", userSchema);

const createUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if(exists) return exists;

    const newUser = new UserModel({
        userId: user.id,
        username: user.username,
        discriminator: user.discriminator,
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

export { createUser, deleteUser, getUser, getUsers, createUsers, UserModel };
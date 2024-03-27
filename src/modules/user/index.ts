import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import {config} from "@/config";
import {Command} from "@/interfaces";
import {getColorInt, useImageHex} from "@/modules/messages";
import {InformationEmbed} from "@/modules/messages/embeds";
import userSchema from "@/modules/schemas/User";
import {User} from "discord.js";
import mongoose from "mongoose";

const UserModel = mongoose.model("User", userSchema);

const root = (x: number, n: number) => {
    return Math.pow(Math.E, Math.log(x) / n);
}

const expToLevel = (exp: number) => {
    return Math.floor(
        root(exp, 3) * config.experience.constant
    );
};

const levelToExp = (level: number) => {
    return Math.floor(
        Math.pow(level / config.experience.constant, 3)
    );
};

const createUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if (exists) return exists;

    const newUser = new UserModel({
        userId: user.id,
        username: user.username,
        avatarUrl: user.displayAvatarURL({ extension: "png" })
    });

    await newUser.save();
    return newUser;
}

const deleteUser = async (userId: string) => {
    const exists = await UserModel.findOne({ userId });
    if (!exists) return null;

    await UserModel.deleteOne({ userId });
    return true;
}

const getUser = async (user: User) => {
    if (user.bot) return null;

    let exists = await UserModel.findOne({ userId: user.id });

    if (!exists) {
        exists = await createUser(user);
    }

    return exists;
}

const getUsers = async () => {
    return UserModel.find();
}

const updateUser = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if (!exists) {
        exists = await createUser(user);
    }

    exists.username = user.username;
    exists.avatarUrl = user.displayAvatarURL({ extension: "png" });

    await exists.save();

    return exists;
}

export interface UpdateUserPublicTimeStatisticsProps {
    userId: string;
}

export const updateUserPublicTimeStatistics = async ({ userId }: UpdateUserPublicTimeStatisticsProps) => {
    const user = await UserModel.findOne({userId});
    if (!user) return null;

    user.publicTimeStatistics = !user.publicTimeStatistics;

    await user.save();
    return user;
}

const getNewFeatures = async (client: ExtendedClient, oldLevel: number, newLevel: number) => {
    const newCommands = client.commands.filter(
        (command) => command.options?.level && (command.options.level > oldLevel && command.options.level <= newLevel)
    );

    return {
        commands: newCommands
    }
};

const commandFeature = (client: ExtendedClient, command: Command) => {
    const cmd = client.application?.commands.cache.find((c) => c.name === command.data.name);

    return `</${cmd?.name}:${cmd?.id}> (${cmd?.dmPermission ? i18n.__("newFeatures.global") : i18n.__("newFeatures.guildOnly") })`;
}

interface SendNewFeaturesMessageProps {
    client: ExtendedClient;
    userId: string;
    guildId: string;
    oldLevel: number;
    newLevel: number;
}

const sendNewFeaturesMessage = async ({ client, userId, guildId, oldLevel, newLevel }: SendNewFeaturesMessageProps) => {
    const guild = client.guilds.cache.get(guildId);
    i18n.setLocale(guild?.preferredLocale || "en-US");

    await client.application?.commands.fetch();
    const newFeatures = await getNewFeatures(client, oldLevel, newLevel);
    if (!newFeatures.commands.size) return;

    const user = await client.users.fetch(userId);
    const colors = await useImageHex(user.avatarURL({ extension: "png" }));

    const embed = InformationEmbed()
        .setTitle(i18n.__("newFeatures.title"))
        .setColor(getColorInt(colors.Vibrant))
        .setDescription(i18n.__("newFeatures.description"))
        .setFields([
            {
                name: i18n.__("newFeatures.commands"),
                value: newFeatures.commands.map((command) => commandFeature(client, command)).join("\n"),
                inline: true
            }
        ])
        .setThumbnail("https://i.imgur.com/cSTkdFG.png");

    await user.send({ embeds: [embed] });
};

export { UserModel, createUser, deleteUser, expToLevel, getUser, getUsers, levelToExp, sendNewFeaturesMessage, updateUser };


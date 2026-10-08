import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import {Command} from "@/interfaces";
import {getColorInt, useImageHex} from "@/modules/messages/colors";
import {InformationEmbed} from "@/modules/messages/embeds";
import userSchema from "@/modules/schemas/User";
import {User} from "discord.js";
import mongoose from "mongoose";
import {expToLevel, levelToExp} from "./level";

const UserModel = mongoose.model("User", userSchema);


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

const getUser = async (user: User) => {
    if (user.bot) return null;

    let exists = await UserModel.findOne({ userId: user.id });

    if (!exists) {
        exists = await createUser(user);
    }

    // userUpdate events get missed (e.g. while offline) -> stale avatar hash 404s on the CDN
    const avatarUrl = user.displayAvatarURL({ extension: "png" });
    if (exists.avatarUrl !== avatarUrl || exists.username !== user.username) {
        exists.avatarUrl = avatarUrl;
        exists.username = user.username;
        await exists.save();
    }

    return exists;
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
        .setThumbnail("https://em-content.zobj.net/source/microsoft/209/sparkles_2728.png");

    await user.send({ embeds: [embed] });
};

const getUsersCount = async () => {
    return UserModel.countDocuments();
}

export { UserModel, createUser, expToLevel, getUser, levelToExp, sendNewFeaturesMessage, updateUser, getUsersCount };


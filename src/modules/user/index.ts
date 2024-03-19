import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { config } from "@/config";
import { Command, Guild as DatabaseGuild, User as DatabaseUser, DeepPartial, Sorting } from "@/interfaces";
import { ExtendedStatistics } from "@/interfaces/User";
import { getColorInt, useImageHex } from "@/modules/messages";
import { InformationEmbed } from "@/modules/messages/embeds";
import { GuildDocument } from "@/modules/schemas/Guild";
import userSchema, { UserDocument } from "@/modules/schemas/User";
import { merge } from "@/utils/merge";
import { Guild, User } from "discord.js";
import mongoose from "mongoose";

const UserModel = mongoose.model("User", userSchema);

const root = (x: number, n: number) => {
    return Math.pow(Math.E, Math.log(x) / n);
}

const expToLevel = (exp: number) => {
    return Math.floor(
        root(exp, 3) * config.experienceConstant
    );
};

const levelToExp = (level: number) => {
    return Math.floor(
        Math.pow(level / config.experienceConstant, 3)
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

const deleteUser = async (user: User) => {
    const exists = await UserModel.findOne({ userId: user.id });
    if (!exists) return null;

    await UserModel.deleteOne({ userId: user.id });
    return true;
}

const getUser = async (user: User) => {
    if (user.bot)
        return null;

    let exists = await UserModel.findOne({ userId: user.id });

    if (!exists) {
        exists = await createUser(user);
    }

    return exists;
}

const getUserRank = async (user: DatabaseUser) => {
    const exists = await UserModel.findOne({ userId: user.userId });
    if (!exists) return {
        rank: 0,
        total: 0,
    };

    const users = await UserModel.find();
    const sorted = users.sort((a, b) => b.stats.exp - a.stats.exp);
    const rank = sorted.findIndex(u => u.userId === user.userId) + 1;

    return {
        rank,
        total: users.length,
    };
};

const getUsers = async () => {
    const users = await UserModel.find();
    return users;
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

const migrateUsername = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if (!exists) {
        exists = await createUser(user);
    }

    exists.username = user.username;
    exists.set("tag", undefined, { strict: false });

    await exists.save();

    return exists;
}

const setPublicTimeStats = async (user: User) => {
    let exists = await UserModel.findOne({ userId: user.id });
    if (!exists) {
        exists = await createUser(user);
    }

    exists.stats.time.public = !exists.stats.time.public;

    await exists.save();
    return exists;
}

const updateUserStatistics = async (client: ExtendedClient, user: User, statisticsPayload: DeepPartial<ExtendedStatistics>, sourceGuild?: DatabaseGuild) => {
    const userSource = await updateUser(user) as UserDocument;
    
    userSource.stats = merge(userSource.stats, statisticsPayload);
    userSource.day = merge(userSource.day, statisticsPayload);
    userSource.week = merge(userSource.week, statisticsPayload);
    userSource.month = merge(userSource.month, statisticsPayload);

    let userLeveledUpDuringUpdate = false;

    if (userSource.stats.exp >= levelToExp(userSource.stats.level + 1))
        userLeveledUpDuringUpdate = true;

    const oldLevel = userSource.stats.level;
    const newLevel = expToLevel(userSource.stats.exp);
    userSource.stats.level = newLevel;

    await userSource.save();

    if (userLeveledUpDuringUpdate)
        client.emit("userLeveledUp", user, sourceGuild, oldLevel, newLevel);

    return userSource;
};

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

const sendNewFeaturesMessage = async (client: ExtendedClient, user: User, sourceGuild: GuildDocument, oldLevel: number, newLevel: number) => {
    if(sourceGuild) {
        const guild = client.guilds.cache.get(sourceGuild.guildId);
        i18n.setLocale(guild?.preferredLocale || "en-US");
    }

    await client.application?.commands.fetch();
    const newFeatures = await getNewFeatures(client, oldLevel, newLevel);
    if (!newFeatures.commands.size) return;

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

const everyUser = async (callback: (user: UserDocument) => Promise<void>) => {
    const users = await getUsers();
    const promises = users.map(async (user) => await callback(user));
    await Promise.all(promises);
}

const clearExperience = async () => {
    await UserModel.updateMany({}, { $set: { "stats.exp": 0, "stats.level": 0 } });
}

const getRanking = async (type: Sorting, page: number, perPage: number, guild?: Guild, userIds?: string[]) => {
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

const clearTemporaryStatistics = async (type: string) => {
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

    everyUser(async (sourceUser) => {
        switch (type) {
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

const getExperienceProcentage = async (user: UserDocument) => {
    const expToCurrentLevel = levelToExp(user.stats.level);
    const expToLevelUp = levelToExp(user.stats.level+1);

    return (((user.stats.exp-expToCurrentLevel)/(expToLevelUp-expToCurrentLevel))*100).toFixed(2);
};

export { UserModel, clearExperience, clearTemporaryStatistics, createUser, deleteUser, everyUser, expToLevel, getExperienceProcentage, getRanking, getUser, getUserRank, getUsers, levelToExp, migrateUsername, sendNewFeaturesMessage, setPublicTimeStats, updateUser, updateUserStatistics };


import { Guild } from "discord.js";
import mongoose from "mongoose";
import ExtendedClient from "../../client/ExtendedClient";
import { Guild as DatabaseGuild } from "../../interfaces/Guild"
import GuildSchema from "../schemas/Guild";

const GuildModel = mongoose.model("Guild", GuildSchema);

const createGuild = async (guild: Guild) => {
    const exists = await GuildModel.findOne({ guildId: guild.id });
    if(exists) return new Error("Guild already exists");

    const newGuild = new GuildModel({ guildId: guild.id, channelId: null });
    await newGuild.save();
    return newGuild;
}

const deleteGuild = async (guild: Guild) => {
    const guildToDelete = await GuildModel.findOne({ guildId: guild.id });

    if(!guildToDelete) return new Error("Guild not found");

    await GuildModel.deleteOne({ guildId: guild.id });
    return true;
}

const getGuild = async (guild: Guild) => {
    const exist = await GuildModel.findOne({ guildId: guild.id });
    if(!exist) return new Error("Guild not found");

    return exist;
}

const getGuilds = async () => {
    const guilds = await GuildModel.find();
    return guilds;
}

const setDefaultChannelId = async (guild: Guild, channelId: string) => {
    const guildToUpdate = await GuildModel.findOne({ guildId: guild.id });
    if(!guildToUpdate) return new Error("Guild not found");

    guildToUpdate.channelId = channelId;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setNotifications = async (guild: Guild) => {
    const guildToUpdate = await GuildModel.findOne({ guildId: guild.id });
    if(!guildToUpdate) return new Error("Guild not found");

    guildToUpdate.notifications = !guildToUpdate.notifications;
    await guildToUpdate.save();
    return guildToUpdate;
}

const everyGuild = async (client: ExtendedClient, callback: (discordGuild: Guild, databaseGuild: DatabaseGuild) => void) => {
    const guilds = await getGuilds();

    if(!guilds.length) return new Error("No guilds found in database");
    
    guilds.forEach(async databaseGuild => {
        const discordGuild = await client.guilds.cache.get(databaseGuild.guildId);
        if(!discordGuild) return;

        await callback(discordGuild, databaseGuild);
    })
}

export { createGuild, deleteGuild, setDefaultChannelId, getGuild, getGuilds, setNotifications, everyGuild };
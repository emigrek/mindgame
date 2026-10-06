import GuildSchema, {GuildDocument} from "@/modules/schemas/Guild";
import {Client, TextChannel} from "discord.js";
import mongoose from "mongoose";

const GuildModel = mongoose.model("Guild", GuildSchema);

const createGuild = async (guildId: string): Promise<GuildDocument> => {
    const exists = await GuildModel.findOne({ guildId });
    if(exists) return exists;

    const newGuild = new GuildModel({ guildId, channelId: null });
    await newGuild.save();
    return newGuild;
}

const getGuild = async (guildId: string): Promise<GuildDocument | null> => {
    const exist = await GuildModel.findOne({ guildId });
    if(!exist) return createGuild(guildId);
    return exist;
}

interface GuildSetDefaultChannelIdProps {
    guildId: string;
    channelId: string;
}

const setDefaultChannelId = async ({ guildId, channelId }: GuildSetDefaultChannelIdProps): Promise<GuildDocument | null> => {
    const guildToUpdate = await GuildModel.findOne({ guildId });
    if(!guildToUpdate) return null;

    guildToUpdate.channelId = channelId;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setNotifications = async (guildId: string): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({ guildId: guildId });
    if(!guildToUpdate) return null;

    guildToUpdate.notifications = !guildToUpdate.notifications;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setLevelRoles = async (guildId: string): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({ guildId });
    if(!guildToUpdate) return null;

    guildToUpdate.levelRoles = !guildToUpdate.levelRoles;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setLevelRolesHoist = async (guildId: string): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({
        guildId: guildId
    });
    if(!guildToUpdate) return null;

    guildToUpdate.levelRolesHoist = !guildToUpdate.levelRolesHoist;
    await guildToUpdate.save();
    return guildToUpdate;
}

const setAutoSweeping = async (guildId: string): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({
        guildId: guildId
    });
    if(!guildToUpdate) return null;

    guildToUpdate.autoSweeping = !guildToUpdate.autoSweeping;
    await guildToUpdate.save();
    return guildToUpdate;
}

// The configured channel, or null when notifications are off or the channel was deleted or is inaccessible.
// channels.fetch throws for those, so `if (!channel)` checks after it never ran.
const getNotificationChannel = async (client: Client, guildId: string, { requireNotifications = true } = {}): Promise<TextChannel | null> => {
    const sourceGuild = await getGuild(guildId);
    if (!sourceGuild?.channelId || (requireNotifications && !sourceGuild.notifications)) return null;

    const channel = await client.channels.fetch(sourceGuild.channelId).catch(() => null);
    return channel instanceof TextChannel ? channel : null;
}

const getGuildsCount = async () => {
    return GuildModel.countDocuments();
}

const setLevelRoleIds = async (guildId: string, levelRoleIds: Map<string, string>) => {
    await GuildModel.updateOne({ guildId }, { $set: { levelRoleIds: Object.fromEntries(levelRoleIds) } });
}

const setLevelRoleId = async (guildId: string, level: number, roleId: string) => {
    await GuildModel.updateOne({ guildId }, { $set: { [`levelRoleIds.${level}`]: roleId } });
}

const setColorRoleId = async (guildId: string, userId: string, roleId: string | null) => {
    await GuildModel.updateOne({ guildId }, roleId
        ? { $set: { [`colorRoleIds.${userId}`]: roleId } }
        : { $unset: { [`colorRoleIds.${userId}`]: 1 } });
}

export { createGuild, getGuild, getNotificationChannel, setAutoSweeping, setColorRoleId, setDefaultChannelId, setLevelRoleId, setLevelRoleIds, setLevelRoles, setLevelRolesHoist, setNotifications, getGuildsCount };


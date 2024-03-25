import GuildSchema, { GuildDocument } from "@/modules/schemas/Guild";
import mongoose from "mongoose";

const GuildModel = mongoose.model("Guild", GuildSchema);

const createGuild = async (guildId: string): Promise<GuildDocument> => {
    const exists = await GuildModel.findOne({ guildId });
    if(exists) return exists;

    const newGuild = new GuildModel({ guildId, channelId: null });
    await newGuild.save();
    return newGuild;
}

const deleteGuild = async (guildId: string): Promise<boolean | null> => {
    const guildToDelete = await GuildModel.findOne({ guildId: guildId });

    if(!guildToDelete) return null;

    await GuildModel.deleteOne({ guildId });
    return true;
}

const getGuild = async (guildId: string): Promise<GuildDocument | null> => {
    const exist = await GuildModel.findOne({ guildId });
    if(!exist) return createGuild(guildId);
    return exist;
}

const getGuilds = async (): Promise<GuildDocument[]> => {
    const guilds = await GuildModel.find();
    return guilds;
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

const setAutoSweeing = async (guildId: string): Promise<GuildDocument | null>  => {
    const guildToUpdate = await GuildModel.findOne({
        guildId: guildId
    });
    if(!guildToUpdate) return null;

    guildToUpdate.autoSweeping = !guildToUpdate.autoSweeping;
    await guildToUpdate.save();
    return guildToUpdate;
}

export { createGuild, deleteGuild, getGuild, getGuilds, setAutoSweeing, setDefaultChannelId, setLevelRoles, setLevelRolesHoist, setNotifications };


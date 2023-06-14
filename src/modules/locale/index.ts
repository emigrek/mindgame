import ExtendedClient from "../../client/ExtendedClient";
import { Guild as DiscordGuild } from "discord.js";
import { getGuild } from "../guild";
import mongoose from "mongoose";
import GuildSchema, { GuildDocument } from "../schemas/Guild";

const GuildModel = mongoose.model("Guild", GuildSchema);

const withGuildLocale = async (client: ExtendedClient, guild: DiscordGuild): Promise<void> => {
    if(!guild) return;
    const sourceGuild = await getGuild(guild);
    if(!sourceGuild) return;

    client.i18n.setLocale(sourceGuild.locale);
}

const setLocale = async (guild: DiscordGuild, locale: string): Promise<GuildDocument | null> => {
    const exist = await GuildModel.findOne({ guildId: guild.id });
    if(!exist) return null;
    
    exist.locale = locale;
    await exist.save();
    return exist;
}

export { withGuildLocale, setLocale };
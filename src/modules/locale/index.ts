import ExtendedClient from "../../client/ExtendedClient";
import { Guild as DiscordGuild } from "discord.js";
import { getGuild } from "../guild";
import mongoose from "mongoose";
import { Guild as GuildInterface } from "../../interfaces";

import GuildSchema from "../schemas/Guild";

const GuildModel = mongoose.model("Guild", GuildSchema);

const withGuildLocale = async (client: ExtendedClient, guild: DiscordGuild) => {
    const sourceGuild = await getGuild(guild) as GuildInterface;
    client.i18n.setLocale(sourceGuild?.locale);
}

const setLocale = async (guild: DiscordGuild, locale: string) => {
    const exist = await GuildModel.findOne({ guildId: guild.id });
    if(!exist) return new Error("Guild not found");
    
    exist.locale = locale;
    await exist.save();
    return exist;
}

export { withGuildLocale, setLocale };
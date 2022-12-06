import { Guild } from "discord.js"

export interface Database {
    createGuild: (guild: Guild) => Promise<void>;
}
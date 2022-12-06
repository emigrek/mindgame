import { Guild } from "discord.js";

export type Database = {
    createGuild?: (guild: Guild) => Promise<void>;
} | null;
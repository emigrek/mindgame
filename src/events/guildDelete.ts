import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {endGuildActivities} from "@/modules/activity";
import {Guild} from "discord.js";

// Without this, open sessions of a guild the bot left kept earning time and EXP every minute
export const guildDelete: Event = {
    name: "guildDelete",
    run: async (client: ExtendedClient, guild: Guild) => {
        await endGuildActivities(guild.id);
    }
}

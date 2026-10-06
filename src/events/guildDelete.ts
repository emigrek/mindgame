import {Event} from "@/interfaces";
import {endGuildActivities} from "@/modules/activity";

// Without this, open sessions of a guild the bot left kept earning time and EXP every minute
export const guildDelete: Event<"guildDelete"> = {
    name: "guildDelete",
    run: async (client, guild) => {
        await endGuildActivities(guild.id);
    }
}

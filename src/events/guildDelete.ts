import { Event } from "../interfaces";
import { deleteGuild } from "../modules/guild";

export const guildDelete: Event = {
    name: "guildDelete",
    run: async (client, guild) => {
        //await deleteGuild(guild);
    }
}
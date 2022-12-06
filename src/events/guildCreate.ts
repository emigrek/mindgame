import { BaseChannel, ChannelType, TextChannel } from "discord.js";
import { Event } from "../interfaces/Event";
import { createGuild } from "../modules/guild";
import { sendMissingDefaultChannelMessage } from "../modules/messages";

export const guildCreate: Event = {
    name: "guildCreate",
    run: async (client, guild) => {
        await createGuild(guild);
        await sendMissingDefaultChannelMessage(client, guild);
    }
}
import { Guild, TextChannel, User } from "discord.js";
import ExtendedClient from "../client/ExtendedClient";
import { Guild as DatabaseGuild } from "../interfaces";
import { Event } from "../interfaces";
import { getGuild } from "../modules/guild";
import { getDailyRewardMessagePayload } from "../modules/messages";


export const userRecievedDailyReward: Event = {
    name: "userRecievedDailyReward",
    run: async (client: ExtendedClient, user: User, guild: Guild, next: number) => {
        const sourceGuild = await getGuild(guild);
        if(!sourceGuild || !sourceGuild.channelId) return;

        const defaultChannel = guild.channels.cache.get(sourceGuild.channelId) as TextChannel;
        if(!defaultChannel) return;

        const dailyRewardMessagePayload = await getDailyRewardMessagePayload(client, user, guild, next);
        await defaultChannel.send(dailyRewardMessagePayload);
    }
}
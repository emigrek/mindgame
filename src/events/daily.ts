import { Guild, TextChannel } from "discord.js";
import { Event } from "../interfaces";
import { everyGuild } from "../modules/guild";
import { clearTemporaryStatistics } from "../modules/user";
import { Guild as DatabaseGuild } from "../interfaces";
import { getStatisticsMessagePayload } from "../modules/messages";

export const daily: Event = {
    name: "daily",
    run: async (client) => {
        await clearTemporaryStatistics(client, 'day');

        await everyGuild(client, async (guild: Guild, sourceGuild: DatabaseGuild) => {
            if(!sourceGuild.notifications) return;
            if(!sourceGuild.channelId) return;

            const guildStatisticsPayload = await getStatisticsMessagePayload(client, guild);
            const channel = guild.channels.cache.get(sourceGuild.channelId) as TextChannel;
            if(!channel) return;

            await channel.send(guildStatisticsPayload);
        });
    }
}
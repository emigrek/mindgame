import { TextChannel } from "discord.js";
import { Event } from "../interfaces";
import { getGuilds } from "../modules/guild";
import { clearTemporaryStatistics } from "../modules/user";
import { getStatisticsMessagePayload } from "../modules/messages";

export const daily: Event = {
    name: "daily",
    run: async (client) => {
        await clearTemporaryStatistics(client, 'day');
        const sourceGuilds = await getGuilds();

        for await (const sourceGuild of sourceGuilds) {
            if(!sourceGuild.statisticsNotification) continue;
            if(!sourceGuild.channelId) continue;

            const guild = await client.guilds.fetch(sourceGuild.guildId);
            const guildStatisticsPayload = await getStatisticsMessagePayload(client, guild);
            const channel = guild.channels.cache.get(sourceGuild.channelId) as TextChannel;
            if(!channel) continue;

            await channel.send(guildStatisticsPayload);
        }
    }
}
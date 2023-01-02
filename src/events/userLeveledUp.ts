import { Guild, TextChannel } from "discord.js";
import { Guild as DatabaseGuild } from "../interfaces";
import { Event } from "../interfaces";
import { everyGuild, getGuilds } from "../modules/guild";
import { getLevelUpMessagePayload } from "../modules/messages";
import { assignUserLevelRole } from "../modules/roles";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client, user) => {
        const sourceGuilds = await getGuilds();

        for await (const sourceGuild of sourceGuilds) {
            const guild = await client.guilds.fetch(sourceGuild.guildId);
            const { notifications, channelId, levelRoles } = sourceGuild;
            if(!notifications || !channelId) continue;

            const channel = guild.channels.cache.get(channelId) as TextChannel;
            if(!channel) continue;
            if(levelRoles) {
                await assignUserLevelRole(client, user, guild);
            }

            const levelUpMesssagePayload = await getLevelUpMessagePayload(client, user, guild);
            await channel.send(levelUpMesssagePayload);
        }
    }
}
import { Guild, TextChannel } from "discord.js";
import { Guild as DatabaseGuild } from "../interfaces";
import { Event } from "../interfaces";
import { everyGuild } from "../modules/guild";
import { getLevelUpMessagePayload } from "../modules/messages";
import { assignLevelRolesInAllGuilds, assignUserLevelRole } from "../modules/roles";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client, user) => {
        await assignLevelRolesInAllGuilds(client, user);
        await everyGuild(client, async (guild: Guild, sourceGuild: DatabaseGuild) => {
            const { notifications, channelId, levelRoles } = sourceGuild;
            if(!notifications || !channelId) return;

            const channel = guild.channels.cache.get(channelId) as TextChannel;
            if(!channel) return;
            if(levelRoles) {
                await assignUserLevelRole(client, user, guild);
            }

            const levelUpMesssagePayload = await getLevelUpMessagePayload(client, user, guild);
            await channel.send(levelUpMesssagePayload);
        });
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import {ActivityStreak, Event} from "@/interfaces";
import {getGuild} from "@/modules/guild";
import {createMessage, getDailyRewardMessagePayload} from "@/modules/messages";
import {TextChannel} from "discord.js";


export const userReceivedDailyReward: Event = {
    name: "userReceivedDailyReward",
    run: async (client: ExtendedClient, userId: string, guildId: string, streak: ActivityStreak) => {
        const sourceGuild = await getGuild(guildId);
        if(!sourceGuild || !sourceGuild.channelId || !sourceGuild.notifications) return;

        const guild = await client.guilds.fetch(guildId);
        const defaultChannel = guild.channels.cache.get(sourceGuild.channelId) as TextChannel;
        if(!defaultChannel) return;

        const user = await client.users.fetch(userId);
        const dailyRewardMessagePayload = await getDailyRewardMessagePayload(client, user, guild, streak);
        if(!dailyRewardMessagePayload) return;
        
        await defaultChannel.send(dailyRewardMessagePayload)
            .then(async message => {
                await createMessage(message, user.id, "dailyRewardMessage");
            })
            .catch(error => {
                console.log("Error while sending daily reward message: ", error);
            });
    }
}
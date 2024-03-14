import { Guild, TextChannel, User } from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import { createMessage, getDailyRewardMessagePayload } from "@/modules/messages";


export const userRecievedDailyReward: Event = {
    name: "userRecievedDailyReward",
    run: async (client: ExtendedClient, user: User, guild: Guild, streak: number) => {
        const sourceGuild = await getGuild(guild);
        if(!sourceGuild || !sourceGuild.channelId || !sourceGuild.notifications) return;

        const defaultChannel = guild.channels.cache.get(sourceGuild.channelId) as TextChannel;
        if(!defaultChannel) return;

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
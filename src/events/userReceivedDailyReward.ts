import ExtendedClient from "@/client/ExtendedClient";
import {ActivityStreak, Event} from "@/interfaces";
import {getGuild} from "@/modules/guild";
import {createMessage, getDailyRewardMessagePayload} from "@/modules/messages";
import {TextChannel} from "discord.js";
import NotificationsManager from "@/modules/messages/notificationsManager";


export const userReceivedDailyReward: Event = {
    name: "userReceivedDailyReward",
    run: async (client: ExtendedClient, userId: string, guildId: string, streak: ActivityStreak) => {
        const sourceGuild = await getGuild(guildId);
        if(!sourceGuild || !sourceGuild.channelId || !sourceGuild.notifications) return;

        const guild = await client.guilds.fetch(guildId);
        const defaultChannel = await guild.channels.fetch(sourceGuild.channelId);
        if(!defaultChannel) return;

        const user = await client.users.fetch(userId);
        await NotificationsManager.getInstance().schedule({
            channel: defaultChannel as TextChannel,
            payload: await getDailyRewardMessagePayload(client, user, guild, streak),
            callback: async message => {
                await createMessage(message, user.id, "dailyRewardMessage");
            }
        });
    }
}
import {Event} from "@/interfaces";
import {getNotificationChannel} from "@/modules/guild";
import {createMessage, getDailyRewardMessagePayload} from "@/modules/messages";
import NotificationsManager from "@/modules/messages/notificationsManager";
import {MessageTypeIds} from "@/interfaces/Message";


export const userReceivedDailyReward: Event<"userReceivedDailyReward"> = {
    name: "userReceivedDailyReward",
    run: async (client, userId, guildId, streak) => {
        const channel = await getNotificationChannel(client, guildId);
        if(!channel) return;

        const user = await client.users.fetch(userId);
        await NotificationsManager.getInstance().schedule({
            channel,
            payload: await getDailyRewardMessagePayload(client, user, channel.guild, streak),
            callback: async message => {
                await createMessage({
                    message,
                    typeId: MessageTypeIds.DAILY_REWARD,
                    targetUserId: user.id,
                });
            }
        });
    }
}
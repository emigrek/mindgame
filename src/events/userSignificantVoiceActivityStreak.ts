import {Event} from "@/interfaces";
import {getNotificationChannel} from "@/modules/guild";
import {createMessage, getSignificantVoiceActivityStreakMessagePayload} from "@/modules/messages";
import NotificationsManager from "@/modules/messages/notificationsManager";
import {MessageTypeIds} from "@/interfaces/Message";

export const userSignificantVoiceActivityStreak: Event<"userSignificantVoiceActivityStreak"> = {
    name: "userSignificantVoiceActivityStreak",
    run: async (client, member, streak) => {
        const channel = await getNotificationChannel(client, member.guild.id);
        if (!channel) return;

        await NotificationsManager.getInstance().schedule({
            channel,
            payload: await getSignificantVoiceActivityStreakMessagePayload(client, member, streak),
            callback: async message => {
                await message.react("😱");
                await createMessage({
                    message,
                    typeId: MessageTypeIds.SIGNIFICANT_VOICE_ACTIVITY_STREAK,
                    targetUserId: member.user.id,
                });
            }
        });
    }
}
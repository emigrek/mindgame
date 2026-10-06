import ExtendedClient from "@/client/ExtendedClient";
import { AchievementType, Event } from "@/interfaces";
import { BaseAchievement } from "@/modules/achievement";
import { getNotificationChannel } from "@/modules/guild";
import { getAchievementLeveledUpMessagePayload } from "@/modules/messages";
import NotificationsManager from "@/modules/messages/notificationsManager";

export const achievementLeveledUp: Event = {
    name: "achievementLeveledUp",
    run: async (client: ExtendedClient, achievement: BaseAchievement<AchievementType>, change: number) => {
        const { userId, guildId } = achievement;
        if (!userId || !guildId) return;
        if (change > 1 && !achievement.announceLevelJumps) return;

        const channel = await getNotificationChannel(client, guildId);
        if (!channel) return;

        const user = await client.users.fetch(userId);
        await NotificationsManager.getInstance().schedule({
            channel,
            payload: await getAchievementLeveledUpMessagePayload(user, channel.guild, achievement, change),
        });
    }
}

import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Collector } from "@/modules/achievement/achievements";
import { getNotificationChannel } from "@/modules/guild";
import { getAchievementLeveledUpMessagePayload } from "@/modules/messages";
import NotificationsManager from "@/modules/messages/notificationsManager";

export const achievementLeveledUp: Event<"achievementLeveledUp"> = {
    name: "achievementLeveledUp",
    run: async (client, achievement, change) => {
        const { userId, guildId } = achievement;
        if (!userId || !guildId) return;

        new AchievementManager({ client, userId, guildId })
            .check(new Collector({ leveledUpType: achievement.achievementType }));

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

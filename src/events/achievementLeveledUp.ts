import ExtendedClient from "@/client/ExtendedClient";
import { AchievementType, Event } from "@/interfaces";
import { BaseAchievement } from "@/modules/achievement";
import { getGuild } from "@/modules/guild";
import { getAchievementLeveledUpMessagePayload } from "@/modules/messages";
import NotificationsManager from "@/modules/messages/notificationsManager";
import { TextChannel } from "discord.js";

export const achievementLeveledUp: Event = {
    name: "achievementLeveledUp",
    run: async (client: ExtendedClient, achievement: BaseAchievement<AchievementType>) => {
        const { userId, guildId } = achievement;
        if (!userId || !guildId) return;

        const sourceGuild = await getGuild(guildId);
        if (!sourceGuild || !sourceGuild.channelId || !sourceGuild.notifications) return;

        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(sourceGuild.channelId);
        if (!channel) return;

        const user = await client.users.fetch(userId);
        await NotificationsManager.getInstance().schedule({
            channel: channel as TextChannel,
            payload: await getAchievementLeveledUpMessagePayload(user, guild, achievement),
        });
    }
}

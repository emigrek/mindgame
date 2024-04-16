import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {getGuild} from "@/modules/guild";
import {createMessage, getLevelUpMessagePayload, getMessage} from "@/modules/messages";
import {assignUserLevelRole, isLevelThreshold} from "@/modules/roles";
import {sendNewFeaturesMessage} from "@/modules/user";
import {TextChannel} from "discord.js";
import NotificationsManager from "@/modules/messages/notificationsManager";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client: ExtendedClient, userId: string, guildId: string, oldLevel: number, newLevel: number) => {
        await sendNewFeaturesMessage({ client, userId, guildId, oldLevel, newLevel })
            .catch(err => console.log("Error while sending new features message: ", err));

        const sourceGuild = await getGuild(guildId);
        if (!sourceGuild) return;

        const { notifications, channelId, levelRoles } = sourceGuild;
        if (levelRoles && isLevelThreshold(newLevel)) {
            await assignUserLevelRole({ client, userId, guildId });
        }
        
        if (!notifications || !channelId) return;

        const guild = await client.guilds.fetch(guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId) as TextChannel;
        if (!channel) return;

        if (!isLevelThreshold(newLevel)) return;

        const user = await client.users.fetch(userId);
        const levelUpMessagePayload = await getLevelUpMessagePayload(client, user, guild, newLevel);
        const existing = await getMessage({
            channelId: channel.id,
            targetUserId: user.id,
            name: "levelUpMessage"
        });

        if (existing) {
            const message = await channel.messages.fetch(existing.messageId);
            await message.edit(levelUpMessagePayload)
                .catch(error => {
                    console.log("Error while editing level up message: ", error);
                });
            return;
        }

        await NotificationsManager.getInstance().schedule({
            channel: channel,
            payload: levelUpMessagePayload,
            callback: async message => {
                await message.react("🎉");
                await createMessage(message, user.id, "levelUpMessage");
            }
        });
    }
}
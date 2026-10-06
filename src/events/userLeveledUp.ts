import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {getGuild, getNotificationChannel} from "@/modules/guild";
import {createMessage, fetchTrackedMessage, getLevelUpMessagePayload, getMessage} from "@/modules/messages";
import {assignUserLevelRole, crossesLevelThreshold} from "@/modules/roles";
import {sendNewFeaturesMessage} from "@/modules/user";
import NotificationsManager from "@/modules/messages/notificationsManager";
import {MessageTypeIds} from "@/interfaces/Message";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client: ExtendedClient, userId: string, guildId: string, oldLevel: number, newLevel: number) => {
        await sendNewFeaturesMessage({ client, userId, guildId, oldLevel, newLevel })
            .catch(err => console.log("Error while sending new features message: ", err));

        const sourceGuild = await getGuild(guildId);
        if (!sourceGuild) return;

        const { levelRoles } = sourceGuild;
        const crossedThreshold = crossesLevelThreshold(oldLevel, newLevel);
        if (levelRoles && crossedThreshold) {
            await assignUserLevelRole({ client, userId, guildId });
        }
        
        if (!crossedThreshold) return;

        const channel = await getNotificationChannel(client, guildId);
        if (!channel) return;
        const { guild } = channel;
        
        const user = await client.users.fetch(userId);
        const levelUpMessagePayload = await getLevelUpMessagePayload(client, user, guild, newLevel);
        const existing = await getMessage({
            channelId: channel.id,
            targetUserId: user.id,
            typeId: MessageTypeIds.LEVEL_UP,
        });

        const message = existing ? await fetchTrackedMessage(channel, existing.messageId) : null;
        if (message) {
            // Edits only accept SuppressEmbeds, so the SuppressNotifications flag made every edit fail
            const { flags: _flags, ...editPayload } = levelUpMessagePayload; // eslint-disable-line @typescript-eslint/no-unused-vars
            await message.edit(editPayload)
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
                await createMessage({
                    message,
                    typeId: MessageTypeIds.LEVEL_UP,
                    targetUserId: user.id,
                });
            }
        });
    }
}
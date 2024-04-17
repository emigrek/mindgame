import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import NotificationsManager from "@/modules/messages/notificationsManager";
import {attachQuickButtons, createMessage, getInviteNotificationMessagePayload, getMessage} from "@/modules/messages";
import {config} from "@/config";
import {getRandomNumber} from "@/utils/random";
import {TextChannel} from "discord.js";
import {MessageTypeIds} from "@/interfaces/Message";

export const ready: Event = {
    name: 'ready',
    run: async (client: ExtendedClient) => {
        await client.loadModules();

        NotificationsManager.getInstance().setWorkStartCallback(
            async (channelId: string) => {
                const channel = await client.channels.fetch(channelId) as TextChannel;
                const chance = config.inviteNotification.chance > getRandomNumber(0, 100);

                if (channel && config.inviteNotification.enabled && chance) {
                    const exist = await getMessage({
                        channelId: channel.id,
                        typeId: MessageTypeIds.INVITE_NOTIFICATION
                    });

                    if (exist) {
                        const message = await channel.messages.fetch(exist.messageId);
                        await message.delete();
                    }

                    await NotificationsManager.getInstance().schedule({
                        channel,
                        payload: await getInviteNotificationMessagePayload(client, channel.guild),
                        callback: async message => {
                            await createMessage({
                                message,
                                typeId: MessageTypeIds.INVITE_NOTIFICATION,
                            });
                        }
                    });
                }
            }
        );

        NotificationsManager.getInstance().setWorkEndCallback(
            async (channelId: string) => {
                await attachQuickButtons(client, channelId);
            }
        );

        console.log(`Logged in as ${client.user?.username} 🌌`);
    }
}
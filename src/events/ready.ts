import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import NotificationsManager from "@/modules/messages/notificationsManager";
import {attachQuickButtons, getInviteNotificationMessagePayload} from "@/modules/messages";
import {config} from "@/config";
import {getRandomNumber} from "@/utils/random";
import {TextChannel} from "discord.js";

export const ready: Event = {
    name: 'ready',
    run: async (client: ExtendedClient) => {
        await client.loadModules();

        NotificationsManager.getInstance().setWorkStartCallback(
            async (channelId: string) => {
                const channel = await client.channels.fetch(channelId) as TextChannel;
                const random = getRandomNumber(0, 100);
                if (config.inviteNotification.enabled && config.inviteNotification.chance > random && channel) {
                    await NotificationsManager.getInstance().schedule({
                        channel,
                        payload: await getInviteNotificationMessagePayload(client, channel.guild)
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
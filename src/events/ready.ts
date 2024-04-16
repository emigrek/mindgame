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
                const chance = config.inviteNotification.chance > getRandomNumber(0, 100);

                if (channel && config.inviteNotification.enabled && chance) {
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
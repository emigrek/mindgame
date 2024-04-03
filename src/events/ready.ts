import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import NotificationsManager from "@/modules/messages/notificationsManager";
import {attachQuickButtons} from "@/modules/messages";

export const ready: Event = {
    name: 'ready',
    run: async (client: ExtendedClient) => {
        await client.loadModules();

        NotificationsManager.getInstance().setWorkEndCallback(
            async (channelId: string) => {
                await attachQuickButtons(client, channelId);
            }
        );

        console.log(`Logged in as ${client.user?.username} 🌌`);
    }
}
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { endPresenceActivity, getPresenceActivity, getPresenceClientStatus, startPresenceActivity } from "@/modules/activity";
import { Presence } from "discord.js";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client: ExtendedClient, oldPresence: Presence, newPresence: Presence) => {
        const user = await client.users.fetch(newPresence.userId);
        if (!user || user.bot) return;
        const { member } = newPresence;
        if (!member) return;

        const { id: userId } = user; 
        const { id: guildId } = member.guild;
        const oldStatus = oldPresence?.status;
        const newStatus = newPresence.status;
        const oldClient = getPresenceClientStatus(oldPresence?.clientStatus);
        const newClient = getPresenceClientStatus(newPresence.clientStatus);

        if (
            (oldStatus === 'offline') && (newStatus !== 'offline')
        ) {
            await startPresenceActivity(userId, guildId, newPresence)
            return;
        } else if (
            (oldStatus !== 'offline') && (newStatus === 'offline')
        ) {
            await endPresenceActivity(userId, guildId);
            return;
        } else if (
            (oldStatus !== newStatus)
        ) {
            const existing = await getPresenceActivity(userId, guildId) || await startPresenceActivity(userId, guildId, newPresence);

            existing.status = newStatus;
            await existing.save();
            return;
        } else if (
            (oldStatus === newStatus) && (oldClient !== newClient)
        ) {
            const existing = await getPresenceActivity(userId, guildId) || await startPresenceActivity(userId, guildId, newPresence);

            existing.client = newClient;
            await existing.save();
            return;
        }
    }
}
import { Presence } from "discord.js";
import { Event } from "@/interfaces";
import { endPresenceActivity, startPresenceActivity } from "@/modules/activity";
import ExtendedClient from "@/client/ExtendedClient";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client: ExtendedClient, oldPresence: Presence, newPresence: Presence) => {
        const { member } = newPresence;
        const oldStatus = oldPresence?.status;
        const newStatus = newPresence.status;

        if (!member || member.user.bot) return;

        if (
            (!oldStatus || oldStatus === 'offline') && (newStatus !== 'offline')
        ) {
            await startPresenceActivity(client, member, newPresence);
        } else if (
            (oldStatus || oldStatus !== 'offline') && (newStatus === 'offline')
        ) {
            await endPresenceActivity(client, member);
        }
    }
}
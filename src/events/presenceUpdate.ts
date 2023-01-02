import { PresenceUpdateStatus } from "discord.js";
import { Event } from "../interfaces";
import { endPresenceActivity, startPresenceActivity } from "../modules/activity";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client, oldPresence, newPresence) => {
        const { guild, member } = newPresence;
        if(!member) return;

        const fetchedMember = await member.fetch();
        if(!fetchedMember) return;

        const oldStatus = oldPresence?.status;
        const newStatus = newPresence?.status;

        if(
            (oldStatus === PresenceUpdateStatus.Offline || oldStatus === PresenceUpdateStatus.Invisible || !oldStatus)
             && 
            (newStatus !== PresenceUpdateStatus.Offline || newStatus !== PresenceUpdateStatus.Invisible)
        ) {
            await startPresenceActivity(client, fetchedMember, newPresence);
        } else if(
            (oldStatus !== PresenceUpdateStatus.Offline || oldStatus !== PresenceUpdateStatus.Invisible || oldStatus)
             && 
            (newStatus === PresenceUpdateStatus.Offline || newStatus === PresenceUpdateStatus.Invisible)
        ) {
            await endPresenceActivity(client, fetchedMember);
        }
    }
}
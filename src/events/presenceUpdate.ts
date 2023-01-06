import { PresenceUpdateStatus } from "discord.js";
import { Event } from "../interfaces";
import { endPresenceActivity, startPresenceActivity } from "../modules/activity";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client, oldPresence, newPresence) => {
        const { guild, member } = newPresence;

        const oldStatus = oldPresence?.status;
        const newStatus = newPresence?.status;

        if(oldStatus === newStatus) return;

        try {
            const fetchedMember = await guild.members.fetch(member.id);

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

            console.log(guild.name, " ", fetchedMember.user.tag, " >> ", oldStatus, " >> ", newStatus);
        } catch (error) {
            console.log("Error while updating presence: ", error);
            return;
        }
    }
}
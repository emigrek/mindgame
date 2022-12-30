import { PresenceUpdateStatus } from "discord.js";
import { Event } from "../interfaces";
import { endPresenceActivity, startPresenceActivity } from "../modules/activity";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client, oldPresence, newPresence) => {
        const { guild, member } = newPresence;
        const memberGuilds = client.guilds.cache.filter(g => g.members.cache.has(member.id)); 

        if(!guild.equals(memberGuilds.first()!)) return;

        const oldStatus = oldPresence?.status;
        const newStatus = newPresence?.status;

        if(
            (oldStatus === PresenceUpdateStatus.Offline || oldStatus === PresenceUpdateStatus.Invisible)
             && 
            (newStatus !== PresenceUpdateStatus.Offline || newStatus !== PresenceUpdateStatus.Invisible)
        ) {
            await startPresenceActivity(client, member, newPresence);
        } else if(
            (oldStatus !== PresenceUpdateStatus.Offline || oldStatus !== PresenceUpdateStatus.Invisible)
             && 
            (newStatus === PresenceUpdateStatus.Offline || newStatus === PresenceUpdateStatus.Invisible)
        ) {
            await endPresenceActivity(client, member);
        }
    }
}
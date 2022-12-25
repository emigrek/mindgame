import { PresenceUpdateStatus } from "discord.js";
import { Event } from "../interfaces";
import { endPresenceActivity, startPresenceActivity } from "../modules/activity";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client, oldPresence, newPresence) => {
        const { guild, member } = newPresence;
        const memberGuilds = client.guilds.cache.filter(g => g.members.cache.has(member.id));

        if(guild.id != memberGuilds.first()!.id) return;
        if(!oldPresence.status || !newPresence.status) return;

        const oldStatus = oldPresence.status;
        const newStatus = newPresence.status;

        if(oldStatus === newStatus) return;
        else if(oldStatus === PresenceUpdateStatus.Offline && newStatus !== PresenceUpdateStatus.Offline) {
            await startPresenceActivity(client, member, newPresence);
        } else if(oldStatus !== PresenceUpdateStatus.Offline && newStatus === PresenceUpdateStatus.Offline) {
            await endPresenceActivity(client, member);
        }
    }
}
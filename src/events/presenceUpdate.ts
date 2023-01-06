import { Guild, GuildMember, PresenceUpdateStatus } from "discord.js";
import { Event } from "../interfaces";
import { endPresenceActivity, startPresenceActivity } from "../modules/activity";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client, oldPresence, newPresence) => {
        if(!oldPresence || !newPresence) return;
        const { guild, member } = newPresence;
        if(member.user.bot) return;

        const oldStatus = oldPresence?.status;
        const newStatus = newPresence?.status;

        if(oldStatus === newStatus) return;

        /*
        let fetchedMember: GuildMember;
        let fetchedGuild: Guild;

        try {
            fetchedGuild = await client.guilds.fetch(guild.id);
            await fetchedGuild.members.fetch();
            fetchedMember = await fetchedGuild.members.fetch(member.id);
        } catch (error) {
            console.log("Error while updating presence: ", error);
            return;
        }
        */

        if(
            (oldStatus === PresenceUpdateStatus.Offline || oldStatus === PresenceUpdateStatus.Invisible || !oldStatus)
             && 
            (newStatus !== PresenceUpdateStatus.Offline || newStatus !== PresenceUpdateStatus.Invisible)
        ) {
            await startPresenceActivity(client, member, newPresence);
        } else if(
            (oldStatus !== PresenceUpdateStatus.Offline || oldStatus !== PresenceUpdateStatus.Invisible || oldStatus)
             && 
            (newStatus === PresenceUpdateStatus.Offline || newStatus === PresenceUpdateStatus.Invisible)
        ) {
            await endPresenceActivity(client, member);
        }

        console.log(guild.name, " ", member.user.tag, " >> ", oldStatus, " >> ", newStatus);
    }
}
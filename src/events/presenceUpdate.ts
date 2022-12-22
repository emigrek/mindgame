import { Event } from "../interfaces";
import { endPresenceActivity, startPresenceActivity } from "../modules/activity";

export const presenceUpdate: Event = {
    name: "presenceUpdate",
    run: async (client, oldPresence, newPresence) => {
        // TODO
        // end PresenceActivity in mongo db
        // calculate time online
        // add time online to user statistics
        const { member } = newPresence;
        const oldStatus = oldPresence.status === null ? "offline" : oldPresence.status;
        const newStatus = newPresence.status === null ? "offline" : newPresence.status;
        
        if(oldStatus === "offline" && newStatus !== "offline") {
            startPresenceActivity(client, member, newPresence);
        }
        if(oldStatus !== "offline" && newStatus === "offline") {
            endPresenceActivity(client, member, oldPresence);
        }
    }
}
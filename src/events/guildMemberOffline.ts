import { Event } from "../interfaces";

export const guildMemberOffline: Event = {
    name: "guildMemberOffline",
    run: async (client, member, oldStatus) => {
        // TODO
        // end PresenceActivity in mongo db
        // calculate time online
        // add time online to user statistics
    }
}
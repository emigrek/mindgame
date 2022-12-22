import { Event } from "../interfaces";

export const guildMemberOnline: Event = {
    name: "guildMemberOnline",
    run: async (client, member, newStatus) => {
        // TODO
        // send PresenceActivity to mongo db 
    }
}
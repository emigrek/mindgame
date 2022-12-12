import { Event } from "../interfaces";
import { createUser } from "../modules/user";

export const guildMemberEntered: Event = {
    name: "guildMemberEntered",
    run: async (client, member) => {
        await createUser(member.user);
    }
}
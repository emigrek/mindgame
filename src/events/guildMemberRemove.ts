import { Event } from "@/interfaces";
import { getMemberColorRole } from "@/modules/roles";

export const guildMemberRemove: Event = {
    name: "guildMemberRemove",
    run: async (client, member) => {
        const colorRole = getMemberColorRole(member);

        if (colorRole) {
            await colorRole.delete()
                .catch(e => {
                    console.log(`There was an error when removing level role after member left guild: ${e}`)
                });
        }
    }
}
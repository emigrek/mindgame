import { Event } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import { assignUserLevelRole } from "@/modules/roles";
import { createUser } from "@/modules/user";

export const guildMemberAdd: Event = {
    name: "guildMemberAdd",
    run: async (client, member) => {
        await createUser(member.user);
        const sourceGuild = await getGuild(member.guild);
        if(sourceGuild?.levelRoles) {
            await assignUserLevelRole(member.user, member.guild);
        } 
    }
}
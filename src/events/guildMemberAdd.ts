import { Event } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import { assignUserLevelRole } from "@/modules/roles";
import { createUser } from "@/modules/user";

export const guildMemberAdd: Event<"guildMemberAdd"> = {
    name: "guildMemberAdd",
    run: async (client, member) => {
        await createUser(member.user);
        const sourceGuild = await getGuild(member.guild.id);
        if(sourceGuild?.levelRoles) {
            await assignUserLevelRole({ client, userId: member.id, guildId: member.guild.id });
        } 
    }
}
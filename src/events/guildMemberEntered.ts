import { Event } from "../interfaces";
import { getGuild } from "../modules/guild";
import { assignUserLevelRole } from "../modules/roles";
import { createUser } from "../modules/user";

export const guildMemberEntered: Event = {
    name: "guildMemberEntered",
    run: async (client, member) => {
        await createUser(member.user);
        
        const sourceGuild = await getGuild(member.guild.id);
        if(!sourceGuild || !sourceGuild.levelRoles) return;

        const guild = client.guilds.cache.get(sourceGuild.guildId)!;
        await assignUserLevelRole(client, member.user, guild);
    }
}
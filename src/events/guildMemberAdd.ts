import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import { assignUserLevelRole } from "@/modules/roles";
import { createUser } from "@/modules/user";
import { GuildMember } from "discord.js";

export const guildMemberAdd: Event = {
    name: "guildMemberAdd",
    run: async (client: ExtendedClient, member: GuildMember) => {
        await createUser(member.user);
        const sourceGuild = await getGuild(member.guild);
        if(sourceGuild?.levelRoles) {
            await assignUserLevelRole(member.user, member.guild);
        } 
    }
}
import { Event } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import { levelRoleRegExp } from "@/modules/roles";
import { Role } from "discord.js";

export const roleUpdate: Event = {
    name: "roleUpdate",
    run: async (client, oldRole: Role, newRole: Role) => {
        const { guild } = oldRole;
        const sourceGuild = await getGuild(guild);
        if (!sourceGuild || !sourceGuild.levelRoles) return;

        const isOldRoleLevelRole = levelRoleRegExp.test(oldRole.name);
        const isNewRoleLevelRole = levelRoleRegExp.test(newRole.name);
        if (!isOldRoleLevelRole || (oldRole.name == newRole.name) || isNewRoleLevelRole) return;

        await newRole.setName(oldRole.name)
            .catch(e => {
                console.log(`There was an error when reverting level role name: ${e}`);
            });
    }
}
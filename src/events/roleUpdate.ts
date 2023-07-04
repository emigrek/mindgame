import { Event } from "@/interfaces";
import { getGuild, setLevelRoles, setLevelRolesHoist } from "@/modules/guild";
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
        if (!isOldRoleLevelRole || isNewRoleLevelRole) return;

        const levelRoles = guild.roles.cache.filter(role => levelRoleRegExp.test(role.name));

        if (levelRoles.size) {
            const deletionPromise = levelRoles.map(async (role: Role) => {
                return await role.delete();
            });

            await Promise.all(deletionPromise)
                .then(async () => {
                    if (sourceGuild.levelRoles) {
                        await setLevelRoles(guild);
                    }
                    if (sourceGuild.levelRolesHoist) {
                        await setLevelRolesHoist(guild);
                    }
                })
                .catch(async (e) => {
                    console.log(`Error while deleting level roles on roleUpdate event: ${e}`);
                });
        }
    }
}
import { ColorResolvable, Guild, GuildMember, Role, User } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { Guild as DatabaseGuild, User as DatabaseUser } from "../../interfaces";
import { getGuild, getGuilds } from "../guild";
import { sendToDefaultChannel } from "../messages";
import { getUser } from "../user";

interface LevelTreshold {
    level: number;
    color: ColorResolvable;
}

const getLevelRoleTresholds = () => {
    const tresholds = require("./tresholds.json");
    return tresholds;
}

const getLevelRoleTreshold = (level: number) => {
    const tresholds = require("./tresholds.json");

    let result = tresholds[0];
    tresholds.forEach((treshold: LevelTreshold) => {
        if(level <= treshold.level) {
            result = treshold;
        }
    });

    return result;
}

const getGuildTresholdRole = (guild: Guild, treshold: LevelTreshold) => {
    const levelRole = guild.roles.cache.find(role => role.name.includes(`Level ${treshold.level}`));
    if(!levelRole) return null;
    return levelRole;
}

const getMemberTresholdRole = (member: GuildMember) => {
    const levelRole = member.roles.cache.find(role => role.name.includes("Level"));
    if(!levelRole) return null;
    return levelRole;
}

const syncGuildLevelRoles = async (client: ExtendedClient, guild: Guild) => {
    const sourceGuild = await getGuild(guild) as DatabaseGuild;
    const levelRolesTresholds = getLevelRoleTresholds();
    let levelRoles = guild.roles.cache.filter(role => role.name.includes("Level"));

    if(!levelRoles.size) {
        const creationPromise = levelRolesTresholds.map(async (treshold: LevelTreshold) => {
            return await guild.roles.create({
                name: `Level ${treshold.level}`,
                color: treshold.color,
                hoist: sourceGuild.levelRolesHoist,
                position: 0
            });
        });

        await Promise.all(creationPromise);

        await assignLevelRolesInGuild(client, guild);
    } else {
        const deletionPromise = levelRoles.map(async (role: Role) => {
            return await role.delete();
        });

        await Promise.all(deletionPromise);
    }
}

const syncGuildLevelRolesHoisting = async (client: ExtendedClient, guild: Guild) => {
    const sourceGuild = await getGuild(guild) as DatabaseGuild;
    const levelRoles = guild.roles.cache.filter(role => role.name.includes("Level"));
    if(!levelRoles.size) return null;

    levelRoles.forEach(async (role: Role) => {
        try {
            await role.setHoist(sourceGuild.levelRolesHoist);
        } catch (e) {
            await sendToDefaultChannel(client, guild, client.i18n.__("roles.missingPermissions"));
        }
    });
}

const assignUserLevelRole = async (client: ExtendedClient, user: User, guild: Guild) => {
    const sourceUser = await getUser(user) as DatabaseUser;
    if(!sourceUser) return null;

    const member = await guild.members.fetch(user);
    const currentMemberTresholdRole = await getMemberTresholdRole(member);
    const treshold = getLevelRoleTreshold(sourceUser.stats.level);
    const guildTresholdRole = await getGuildTresholdRole(guild, treshold);
    console.log(treshold);
    console.log(guildTresholdRole)

    if(currentMemberTresholdRole) {
        if(currentMemberTresholdRole.equals(guildTresholdRole!)) return null;

        try {
            await member.roles.remove(currentMemberTresholdRole);
        } catch (error) {
            await sendToDefaultChannel(client, guild, client.i18n.__("roles.missingPermissions"));
            return null;
        }
    }

    if(!guildTresholdRole) return null;

    try {
        await member.roles.add(guildTresholdRole);
    } catch (error) {
        await sendToDefaultChannel(client, guild, client.i18n.__("roles.missingPermissions"));
        return null;
    }
}

const assignLevelRolesInGuild = async (client: ExtendedClient, guild: Guild) => {
    const sourceGuild = await getGuild(guild) as DatabaseGuild;
    if(!sourceGuild.levelRoles) return null;

    const members = await guild.members.fetch();
    for await (const member of members.values()) {
        const success = await assignUserLevelRole(client, member.user, guild);
        if(!success) continue;
    }
}

const assignLevelRolesInAllGuilds = async (client: ExtendedClient, user: User) => {
    const guilds = await getGuilds();

    for await(const sourceGuild of guilds) {
        const guild = await client.guilds.fetch(sourceGuild.guildId);
        if(!guild) continue;

        if(!guild.members.cache.has(user.id)) continue;
        if(!sourceGuild.levelRoles) continue;

        const success = await assignUserLevelRole(client, user, guild);
        if(!success) continue;
    }
};

export { assignUserLevelRole, assignLevelRolesInAllGuilds, syncGuildLevelRolesHoisting, assignLevelRolesInGuild, syncGuildLevelRoles, getLevelRoleTreshold };
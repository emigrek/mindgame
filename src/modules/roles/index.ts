import { ButtonInteraction, Guild, GuildMember, Role, User } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { getGuild, getGuilds } from "../guild";
import { sendToDefaultChannel } from "../messages";
import { getUser } from "../user";
import { LevelTreshold } from "./tresholds";
import { levelTresholds } from "./tresholds";


const getLevelRoleTreshold = (level: number) => {
    let result = levelTresholds[0];

    for (const treshold of levelTresholds) {
        if (level >= treshold.level) {
            result = treshold;
            break;
        } else continue;
    }

    return result;
}

const getGuildTresholdRole = (guild: Guild, treshold: LevelTreshold) => {
    const levelRole = guild.roles.cache.find(role => role.name === `Level ${treshold.level}`);
    if (!levelRole) return null;
    return levelRole;
}

const getMemberTresholdRole = (member: GuildMember) => {
    const levelRole = member.roles.cache.find(role => role.name.includes("Level"));
    if (!levelRole) return null;
    return levelRole;
}

const syncGuildLevelRoles = async (client: ExtendedClient, interaction: ButtonInteraction, guild: Guild) => {
    const sourceGuild = await getGuild(guild);
    if (!sourceGuild) return null;

    const levelRoles = guild.roles.cache.filter(role => role.name.includes("Level"));

    if (!levelRoles.size) {
        const creationPromise = levelTresholds.map(async (treshold: LevelTreshold) => {
            const role = await guild.roles.create({
                name: `Level ${treshold.level}`,
                color: treshold.color,
                hoist: sourceGuild.levelRolesHoist,
                permissions: treshold.permissions,
                position: 0
            });
            return role;
        });

        await Promise.all(creationPromise)
            .catch(async (error) => {
                await interaction.followUp({ content: client.i18n.__("roles.missingPermissions"), ephemeral: true });
                return null;
            })
            .finally(async () => {
                return true;
            });
        await assignLevelRolesInGuild(client, guild);
    } else {
        const deletionPromise = levelRoles.map(async (role: Role) => {
            return await role.delete();
        });

        await Promise.all(deletionPromise)
            .catch(async (error) => {
                await interaction.followUp({ content: client.i18n.__("roles.missingPermissions"), ephemeral: true });
                return null;
            })
            .finally(async () => {
                return true;
            });
    }
}

const syncGuildLevelRolesHoisting = async (client: ExtendedClient, interaction: ButtonInteraction, guild: Guild) => {
    const sourceGuild = await getGuild(guild);
    if (!sourceGuild) return null;
    const levelRoles = guild.roles.cache.filter(role => role.name.includes("Level"));
    if (!levelRoles.size) return null;

    const hoistingPromise = levelRoles.map(async (role: Role) => {
        return await role.setHoist(sourceGuild.levelRolesHoist);
    });

    return await Promise.all(hoistingPromise)
        .catch(async (error) => {
            await interaction.followUp({ content: client.i18n.__("roles.missingPermissions"), ephemeral: true });
            return null;
        })
        .finally(async () => {
            return true;
        });
}

const assignUserLevelRole = async (client: ExtendedClient, user: User, guild: Guild) => {
    const sourceUser = await getUser(user);
    if (!sourceUser) return null;

    const member = guild.members.cache.get(sourceUser.userId);
    if (!member) return null;

    const currentMemberTresholdRole = await getMemberTresholdRole(member);
    const treshold = getLevelRoleTreshold(sourceUser.stats.level);
    const guildTresholdRole = await getGuildTresholdRole(guild, treshold);

    if (currentMemberTresholdRole) {
        if (currentMemberTresholdRole.equals(guildTresholdRole!)) return null;

        try {
            await member.roles.remove(currentMemberTresholdRole);
        } catch (error) {
            return null;
        }
    }

    if (!guildTresholdRole) return null;

    try {
        await member.roles.add(guildTresholdRole);
    } catch (error) {
        return null;
    }
}

const assignLevelRolesInGuild = async (client: ExtendedClient, guild: Guild) => {
    const sourceGuild = await getGuild(guild);
    if (!sourceGuild || !sourceGuild.levelRoles) return null;

    const members = guild.members.cache;
    for await (const member of members.values()) {
        const success = await assignUserLevelRole(client, member.user, guild);
        if (!success) continue;
    }
}

const assignLevelRolesInAllGuilds = async (client: ExtendedClient, user: User) => {
    const guilds = await getGuilds();

    for await (const sourceGuild of guilds) {
        const guild = client.guilds.cache.get(sourceGuild.guildId);
        if (!guild) continue;

        if (!guild.members.cache.has(user.id)) continue;
        if (!sourceGuild.levelRoles) continue;

        const success = await assignUserLevelRole(client, user, guild);
        if (!success) continue;
    }
};

const getMemberColorRole = (member: GuildMember) => {
    const colorRole = member.roles.cache.find(role => role.name.includes("🎨"));
    if (!colorRole) return null;
    return colorRole;
}

const switchColorRole = async (client: ExtendedClient, member: GuildMember) => {
    let colorRole = getMemberColorRole(member);
    const user = await member.user.fetch(true);
    const color = user.hexAccentColor!;
    const clientRole = member.guild.members.cache.get(client.user!.id)!.roles.highest;

    if (!colorRole) {
        try {
            colorRole = await member.guild.roles.create({
                name: "🎨",
                color: color,
                hoist: false,
                position: clientRole.position
            });

            await member.roles.add(colorRole);
            return colorRole;
        } catch (error) {
            return false;
        }
    }

    try {
        colorRole?.delete();
        return true;
    } catch (e) {
        return false;
    }
};

const updateColorRole = async (client: ExtendedClient, member: GuildMember) => {
    const colorRole = getMemberColorRole(member);
    const user = await member.user.fetch(true);
    const color = user.hexAccentColor!;

    if (!colorRole) {
        return false;
    }

    try {
        await colorRole.edit({
            color: color
        });
        return colorRole;
    } catch (e) {
        return false;
    }
};

export { assignUserLevelRole, getMemberColorRole, updateColorRole, switchColorRole, assignLevelRolesInAllGuilds, syncGuildLevelRolesHoisting, assignLevelRolesInGuild, syncGuildLevelRoles, getLevelRoleTreshold };
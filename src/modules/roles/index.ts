import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { getGuild, getGuilds, setLevelRolesHoist } from "@/modules/guild";
import { getUser } from "@/modules/user";
import { ButtonInteraction, ColorResolvable, Guild, GuildMember, Role, User } from "discord.js";

import { colorStore } from "@/stores/colorStore";
import chroma from "chroma-js";
import { getErrorMessagePayload } from "../messages";
import { WarningEmbed } from "../messages/embeds";
import { LevelTreshold, levelTresholds } from "./tresholds";

const levelRoleRegExp = new RegExp('\\bLevel\\s*\\d+\\b');
const specificLevelRoleRegExp = (level: number) => new RegExp(`\\bLevel\\s*${level}\\b`);

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

interface GetGuildTresholdRoleProps {
    client: ExtendedClient;
    guildId: string;
    treshold: LevelTreshold;
}

const getGuildTresholdRole = async ({ client, guildId, treshold }: GetGuildTresholdRoleProps) => {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return null;
    const levelRole = guild.roles.cache.find(role => specificLevelRoleRegExp(treshold.level).test(role.name));
    if (!levelRole) return null;
    return levelRole;
}

const getMemberTresholdRole = (member: GuildMember) => {
    const levelRole = member.roles.cache.find(role => levelRoleRegExp.test(role.name));
    if (!levelRole) return null;
    return levelRole;
}

interface SyncGuildLevelRoles {
    client: ExtendedClient;
    interaction: ButtonInteraction;
}

const syncGuildLevelRoles = async ({ client, interaction }: SyncGuildLevelRoles) => {
    const { guild } = interaction;
    if(!guild) return null;

    const sourceGuild = await getGuild(guild.id);
    if (!sourceGuild) return null;

    if(sourceGuild.levelRoles) {
        return await deleteLevelRoles(guild)
            .catch(async () => {
                await interaction.followUp({
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("roles.missingPermissions"))
                    ], ephemeral: true
                });
                return null;
            })
            .finally(async () => {
                if (sourceGuild.levelRolesHoist) {
                    await setLevelRolesHoist(guild.id);
                }
                return true;
            });
    }

    return await createLevelRoles(guild, sourceGuild.levelRolesHoist)
        .catch(async () => {
            await interaction.followUp({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("roles.missingPermissions"))
                ], ephemeral: true
            });
            return null;
        })
        .finally(async () => {
            await assignLevelRolesInGuild({client, guildId: guild.id});
            return true;
        });
}

const syncGuildLevelRolesHoisting = async (interaction: ButtonInteraction) => {
    const { guild } = interaction;
    if(!guild) return null;

    const sourceGuild = await getGuild(guild.id);
    if (!sourceGuild) return null;

    const levelRoles = guild.roles.cache.filter(role => levelRoleRegExp.test(role.name));
    if (!levelRoles.size) return null;

    const hoistingPromise = levelRoles.map(async (role: Role) => {
        return await role.setHoist(!sourceGuild.levelRolesHoist);
    });

    return await Promise.all(hoistingPromise)
        .catch(async () => {
            await interaction.followUp({ content: i18n.__("roles.missingPermissions"), ephemeral: true });
            return null;
        })
        .finally(async () => {
            return true;
        });
}

interface AssignUserLevelRoleProps {
    client: ExtendedClient;
    userId: string;
    guildId: string;
}

const assignUserLevelRole = async ({ client, userId, guildId }: AssignUserLevelRoleProps) => {
    const user = await client.users.fetch(userId);
    const guild = await client.guilds.fetch(guildId);
    const sourceUser = await getUser(user);
    if (!sourceUser || !guild) return null;

    const member = guild.members.cache.get(sourceUser.userId);
    if (!member) return null;

    const currentMemberTresholdRole = getMemberTresholdRole(member);
    const treshold = getLevelRoleTreshold(sourceUser.stats.level);
    let guildTresholdRole = await getGuildTresholdRole({
        client,
        guildId: guild.id,
        treshold
    });

    if (!guildTresholdRole) {
        const sourceGuild = await getGuild(guildId);
        if (!sourceGuild) return null;

        const tresholdIndex = levelTresholds.findIndex(t => t.level === treshold.level);
        const priorTreshold = levelTresholds[tresholdIndex + 1];
        const priorGuildTresholdRole = priorTreshold ? await getGuildTresholdRole({ client, guildId: guild.id, treshold: priorTreshold }) : null;

        try {
            guildTresholdRole = await guild.roles.create({
                name: `Level ${treshold.level}`,
                color: treshold.color,
                hoist: sourceGuild.levelRolesHoist,
                position: priorGuildTresholdRole ? priorGuildTresholdRole.position + 1 : 0
            });
        } catch (error) {
            return null;
        }
    }

    if (currentMemberTresholdRole) {
        if (currentMemberTresholdRole.equals(guildTresholdRole)) return null;

        try {
            await member.roles.remove(currentMemberTresholdRole);
        } catch (error) {
            return null;
        }
    }

    try {
        await member.roles.add(guildTresholdRole);
    } catch (error) {
        return null;
    }
}

const createLevelRoles = async (guild: Guild, hoist?: boolean) => {
    const creationPromise = levelTresholds.map(async (treshold: LevelTreshold) => {
        const role = await guild.roles.create({
            name: `Level ${treshold.level}`,
            color: treshold.color,
            hoist: hoist || false,
            position: 0
        });
        return role;
    });

    return await Promise.all(creationPromise);
}

const deleteLevelRoles = async (guild: Guild) => {
    const levelRoles = guild.roles.cache.filter(role => levelRoleRegExp.test(role.name));

    if (!levelRoles.size) return;

    const deletionPromise = levelRoles.map(async (role: Role) => {
        return await role.delete();
    });

    return await Promise.all(deletionPromise);
}

interface AssignLevelRolesInGuildProps {
    client: ExtendedClient;
    guildId: string;

}

const assignLevelRolesInGuild = async ({ client, guildId }: AssignLevelRolesInGuildProps) => {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return null;

    const members = await guild.members.fetch();
    const promises = members.map(async (member) => {
        return assignUserLevelRole({
            client,
            userId: member.user.id,
            guildId: guild.id,
        });
    });

    return Promise.all(promises);
}

const assignLevelRolesInAllGuilds = async (client: ExtendedClient, user: User) => {
    const guilds = await getGuilds();

    for await (const sourceGuild of guilds) {
        const guild = client.guilds.cache.get(sourceGuild.guildId);
        if (!guild) continue;

        if (!guild.members.cache.has(user.id)) continue;
        if (!sourceGuild.levelRoles) continue;

        const success = await assignUserLevelRole({
            client,
            userId: user.id,
            guildId: guild.id
        });
        if (!success) continue;
    }
};

const getMemberColorRole = (member: GuildMember) => {
    const colorRole = member.roles.cache.find(role => role.name.includes("🎨"));
    if (!colorRole) return null;
    return colorRole;
}

const updateColorRole = async (client: ExtendedClient, interaction: ButtonInteraction) => {
    const colorState = colorStore.get(interaction.user.id);

    if (!colorState.color) {
        await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
        return;
    }

    const member = interaction.member as GuildMember;
    let colorRole = getMemberColorRole(member);

    if (!colorRole) {
        if (!client.user) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const clientMember = member.guild.members.cache.get(client.user.id);
        if (!clientMember) {
            await interaction.followUp({ ...getErrorMessagePayload(), ephemeral: true });
            return;
        }

        const clientRole = clientMember.roles.highest;

        colorRole = await member.guild.roles.create({
            name: "🎨",
            color: colorState.color as ColorResolvable,
            hoist: false,
            position: clientRole.position
        });

        await member.roles.add(colorRole)
            .catch(async () => {
                await interaction.followUp({
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("roles.missingPermissions"))
                    ], ephemeral: true
                });
            })
        return;
    }

    await colorRole.edit({ color: colorState.color as ColorResolvable })
        .catch(async () => {
            await interaction.followUp({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("roles.missingPermissions"))
                ], ephemeral: true
            });
        });
};

const checkColorLuminance = (hex: `${string}` | string, luminanceTreshold?: number) => {
    const color = chroma(hex);
    const luminance = color.luminance();
    return luminance > (luminanceTreshold || 0.2);
};

export { assignLevelRolesInAllGuilds, assignLevelRolesInGuild, assignUserLevelRole, checkColorLuminance, deleteLevelRoles, getLevelRoleTreshold, getMemberColorRole, levelRoleRegExp, syncGuildLevelRoles, syncGuildLevelRolesHoisting, updateColorRole };


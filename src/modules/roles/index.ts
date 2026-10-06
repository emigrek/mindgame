import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import {getGuild, setColorRoleId, setLevelRoleId, setLevelRoleIds} from "@/modules/guild";
import {GuildDocument} from "@/modules/schemas/Guild";
import {ButtonInteraction, ColorResolvable, Guild, GuildMember, MessageFlags, PartialGuildMember, Role} from "discord.js";

import {getErrorMessagePayload} from "@/modules/messages/error";
import {WarningEmbed} from "@/modules/messages/embeds";
import {getUserGuildStatistics} from "@/modules/user-guild-statistics";
import {colorStore} from "@/stores/colorStore";
import chroma from "chroma-js";
import {adoptLegacyLevelRoles, crossesLevelThreshold, LevelRoleIds, LevelThreshold, levelThresholds} from "./thresholds";

const getLevelRoleThreshold = (level: number) => {
    return levelThresholds
        .find(threshold => level >= threshold.level) || levelThresholds[levelThresholds.length - 1];
}

const getLevelRoleIds = async (guild: Guild, sourceGuild: GuildDocument): Promise<LevelRoleIds> => {
    const levelRoleIds: LevelRoleIds = new Map(sourceGuild.levelRoleIds ?? []);
    // Only guilds with level roles enabled can own legacy roles. Elsewhere "Top 10" would be adopted as level 10.
    if (levelRoleIds.size || !sourceGuild.levelRoles) return levelRoleIds;

    const adopted = adoptLegacyLevelRoles(guild.roles.cache);
    await setLevelRoleIds(guild.id, adopted);
    return adopted;
}

const getLevelRole = (guild: Guild, levelRoleIds: LevelRoleIds, level: number) =>
    guild.roles.cache.get(levelRoleIds.get(String(level)) ?? "") ?? null;

const createLevelRole = async (guild: Guild, levelRoleIds: LevelRoleIds, threshold: LevelThreshold, hoist: boolean) => {
    const thresholdIndex = levelThresholds.findIndex(t => t.level === threshold.level);
    const priorThreshold = levelThresholds[thresholdIndex + 1];
    const priorRole = priorThreshold ? getLevelRole(guild, levelRoleIds, priorThreshold.level) : null;

    const role = await guild.roles.create({
        name: `Level ${threshold.level}`,
        color: threshold.color,
        hoist,
        position: priorRole ? priorRole.position + 1 : 0
    });
    levelRoleIds.set(String(threshold.level), role.id);
    await setLevelRoleId(guild.id, threshold.level, role.id);
    return role;
}

// Creates missing roles one at a time, lowest threshold first, so each lands above the previous one.
// Saving each ID right away means a failed run is resumed instead of creating duplicates.
const ensureLevelRoles = async (guild: Guild, sourceGuild: GuildDocument) => {
    const levelRoleIds = await getLevelRoleIds(guild, sourceGuild);
    for (const threshold of [...levelThresholds].reverse()) {
        if (!getLevelRole(guild, levelRoleIds, threshold.level))
            await createLevelRole(guild, levelRoleIds, threshold, sourceGuild.levelRolesHoist);
    }
    return levelRoleIds;
}

interface GetGuildTresholdRoleProps {
    client: ExtendedClient;
    guildId: string;
    threshold: LevelThreshold;
}

const getGuildTresholdRole = async ({ client, guildId, threshold }: GetGuildTresholdRoleProps) => {
    const guild = await client.guilds.fetch(guildId);
    const sourceGuild = await getGuild(guildId);
    if (!guild || !sourceGuild) return null;
    return getLevelRole(guild, await getLevelRoleIds(guild, sourceGuild), threshold.level);
}

// Swaps any other tracked level role the member has for the given one
const applyLevelRole = async (member: GuildMember, levelRoleIds: LevelRoleIds, levelRole: Role) => {
    const trackedRoleIds = new Set(levelRoleIds.values());
    const staleRoles = member.roles.cache.filter(role => trackedRoleIds.has(role.id) && role.id !== levelRole.id);
    if (staleRoles.size)
        await member.roles.remove(staleRoles);
    if (!member.roles.cache.has(levelRole.id))
        await member.roles.add(levelRole);
    return member;
}

interface SyncGuildLevelRoles {
    client: ExtendedClient;
    interaction: ButtonInteraction;
}

const syncGuildLevelRoles = async ({ client, interaction }: SyncGuildLevelRoles) => {
    const { guild } = interaction;
    if(!guild) return false;

    const sourceGuild = await getGuild(guild.id);
    if (!sourceGuild) return false;

    try {
        if(sourceGuild.levelRoles) {
            await deleteLevelRoles(guild, sourceGuild);
            return true;
        }

        await assignLevelRolesInGuild({client, guildId: guild.id});
        return true;
    } catch (error) {
        console.log(`Error syncing level roles: ${error}`)
        return false;
    }
}

const syncGuildLevelRolesHoisting = async (interaction: ButtonInteraction) => {
    const { guild } = interaction;
    if(!guild) return null;

    const sourceGuild = await getGuild(guild.id);
    if (!sourceGuild) return null;

    const levelRoleIds = await getLevelRoleIds(guild, sourceGuild);
    const levelRoles = [...levelRoleIds.values()]
        .map(roleId => guild.roles.cache.get(roleId))
        .filter((role): role is Role => !!role);
    if (!levelRoles.length) return null;

    return Promise.all(
        levelRoles.map((role: Role) => role.setHoist(!sourceGuild.levelRolesHoist))
    );
}

interface AssignUserLevelRoleProps {
    client: ExtendedClient;
    userId: string;
    guildId: string;
}

const assignUserLevelRole = async ({ client, userId, guildId }: AssignUserLevelRoleProps): Promise<GuildMember | null> => {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return null;
    const member = guild.members.cache.get(userId) ?? await guild.members.fetch(userId).catch(() => null);
    if (!member) return null;
    const sourceGuild = await getGuild(guildId);
    if (!sourceGuild) return null;

    const levelRoleIds = await getLevelRoleIds(guild, sourceGuild);
    const userGuildStatistics = await getUserGuildStatistics({ userId, guildId });
    const threshold = getLevelRoleThreshold(userGuildStatistics.level);

    try {
        // A role deleted by an admin is recreated when someone needs it
        const levelRole = getLevelRole(guild, levelRoleIds, threshold.level)
            ?? await createLevelRole(guild, levelRoleIds, threshold, sourceGuild.levelRolesHoist);
        return await applyLevelRole(member, levelRoleIds, levelRole);
    } catch (error) {
        console.log(`Error assigning level role to ${userId} in ${guildId}: ${error}`);
        return null;
    }
}

// Deletes only roles tracked by ID, never other roles that happen to contain a number
const deleteLevelRoles = async (guild: Guild, sourceGuild: GuildDocument) => {
    const levelRoleIds = await getLevelRoleIds(guild, sourceGuild);
    const results = await Promise.allSettled(
        [...levelRoleIds.values()].map(roleId => guild.roles.cache.get(roleId)?.delete())
    );

    // Keep IDs of roles that failed to delete so the next attempt retries them
    const remaining: LevelRoleIds = new Map([...levelRoleIds].filter((_, i) => results[i].status === "rejected"));
    await setLevelRoleIds(guild.id, remaining);
    if (remaining.size)
        throw new Error(`Failed to delete ${remaining.size} level role(s)`);
}

interface AssignLevelRolesInGuildProps {
    client: ExtendedClient;
    guildId: string;

}

const assignLevelRolesInGuild = async ({ client, guildId }: AssignLevelRolesInGuildProps) => {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return null;
    const sourceGuild = await getGuild(guildId);
    if (!sourceGuild) return null;

    // Create missing roles up front, so parallel assignments below never race to create the same role
    const levelRoleIds = await ensureLevelRoles(guild, sourceGuild);
    const members = await guild.members.fetch();
    return Promise.all(
        members
            .filter(member => !member.user.bot)
            .map(async (member) => {
                const { level } = await getUserGuildStatistics({ userId: member.id, guildId });
                const levelRole = getLevelRole(guild, levelRoleIds, getLevelRoleThreshold(level).level);
                if (levelRole)
                    await applyLevelRole(member, levelRoleIds, levelRole);
            })
            .map(assignment => assignment.catch(error => console.log(`Error assigning level role in ${guildId}: ${error}`)))
    );
}

// Color roles are tracked by ID per member, so admins can rename them freely
const getMemberColorRole = async (member: GuildMember | PartialGuildMember): Promise<Role | null> => {
    const sourceGuild = await getGuild(member.guild.id);
    const roleId = sourceGuild?.colorRoleIds?.get(member.id);
    if (roleId) return member.guild.roles.cache.get(roleId) ?? null;

    // ponytail: one-time adoption of color roles created before IDs were stored; trusts the member cache to tell personal roles from shared ones
    const legacyRole = member.roles.cache.find(role => role.name.includes("🎨") && role.members.size <= 1);
    if (!legacyRole) return null;
    await setColorRoleId(member.guild.id, member.id, legacyRole.id);
    return legacyRole;
}

const deleteMemberColorRole = async (member: GuildMember | PartialGuildMember) => {
    const colorRole = await getMemberColorRole(member);
    if (!colorRole) return;
    await colorRole.delete();
    await setColorRoleId(member.guild.id, member.id, null);
}

const updateColorRole = async (client: ExtendedClient, interaction: ButtonInteraction) => {
    const colorState = colorStore.get(interaction.user.id);

    if (!colorState.color) {
        await interaction.followUp({ ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral });
        return;
    }

    const member = interaction.member as GuildMember;
    let colorRole = await getMemberColorRole(member);

    if (!colorRole) {
        if (!client.user) {
            await interaction.followUp({ ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral });
            return;
        }

        const clientMember = member.guild.members.cache.get(client.user.id);
        if (!clientMember) {
            await interaction.followUp({ ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral });
            return;
        }

        const clientRole = clientMember.roles.highest;

        colorRole = await member.guild.roles.create({
            name: "🎨",
            color: colorState.color as ColorResolvable,
            hoist: false,
            position: clientRole.position
        });
        await setColorRoleId(member.guild.id, member.id, colorRole.id);
    } else {
        await colorRole.edit({ color: colorState.color as ColorResolvable })
            .catch(async () => {
                await interaction.followUp({
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("roles.missingPermissions"))
                    ], flags: MessageFlags.Ephemeral
                });
            });
    }

    // Also covers a tracked role that an admin took away from the member
    if (!member.roles.cache.has(colorRole.id))
        await member.roles.add(colorRole)
            .catch(async () => {
                await interaction.followUp({
                    embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("roles.missingPermissions"))
                    ], flags: MessageFlags.Ephemeral
                });
            });
};

const checkColorLuminance = (hex: string, luminanceTreshold?: number) => {
    const color = chroma(hex);
    const luminance = color.luminance();
    return luminance > (luminanceTreshold || 0.2);
};

export { crossesLevelThreshold, getGuildTresholdRole, assignLevelRolesInGuild, assignUserLevelRole, checkColorLuminance, deleteLevelRoles, deleteMemberColorRole, getLevelRoleThreshold, getMemberColorRole, syncGuildLevelRoles, syncGuildLevelRolesHoisting, updateColorRole };

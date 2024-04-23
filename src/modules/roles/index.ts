import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import {getGuild} from "@/modules/guild";
import {ButtonInteraction, ColorResolvable, Guild, GuildMember, Role} from "discord.js";

import {getErrorMessagePayload} from "@/modules/messages";
import {WarningEmbed} from "@/modules/messages/embeds";
import {getUserGuildStatistics} from "@/modules/user-guild-statistics";
import {colorStore} from "@/stores/colorStore";
import chroma from "chroma-js";
import {LevelThreshold, levelThresholds} from "./thresholds";

const levelRoleRegExp = new RegExp('\\b\\d+\\b');
const specificLevelRoleRegExp = (level: number) => new RegExp(`\\b${level}\\b`);

const getLevelRoleThreshold = (level: number) => {
    return levelThresholds
        .find(threshold => level >= threshold.level) || levelThresholds[levelThresholds.length - 1];
}

interface GetGuildTresholdRoleProps {
    client: ExtendedClient;
    guildId: string;
    threshold: LevelThreshold;
}

const getGuildTresholdRole = async ({ client, guildId, threshold }: GetGuildTresholdRoleProps) => {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return null;
    const levelRole = guild.roles.cache.find(role => specificLevelRoleRegExp(threshold.level).test(role.name));
    if (!levelRole) return null;
    return levelRole;
}

const getMemberThresholdRole = (member: GuildMember) => {
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
    if(!guild) return false;

    const sourceGuild = await getGuild(guild.id);
    if (!sourceGuild) return false;
    
    try {
        if(sourceGuild.levelRoles) {
            await deleteLevelRoles(guild);
            return true;
        }

        await createLevelRoles(guild, sourceGuild.levelRolesHoist);
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

    const levelRoles = guild.roles.cache.filter(role => levelRoleRegExp.test(role.name));
    if (!levelRoles.size) return null;

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
    const member = guild.members.cache.get(userId);
    if (!member) return null;

    const currentMemberTresholdRole = getMemberThresholdRole(member);
    const userGuildStatistics = await getUserGuildStatistics({ userId, guildId });
    const threshold = getLevelRoleThreshold(userGuildStatistics.level);
    let guildTresholdRole = await getGuildTresholdRole({
        client,
        guildId: guild.id,
        threshold
    });

    if (!guildTresholdRole) {
        const sourceGuild = await getGuild(guildId);
        if (!sourceGuild) return null;
 
        const thresholdIndex = levelThresholds.findIndex(t => t.level === threshold.level);
        const priorThreshold = levelThresholds[thresholdIndex + 1];
        const priorGuildTresholdRole = priorThreshold ? await getGuildTresholdRole({ client, guildId: guild.id, threshold: priorThreshold }) : null;

        try {
            guildTresholdRole = await guild.roles.create({
                name: `Level ${threshold.level}`,
                color: threshold.color,
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
        return member.roles.add(guildTresholdRole);
    } catch (error) {
        return null;
    }
}

const createLevelRoles = async (guild: Guild, hoist?: boolean) => {
    return Promise.all(
        levelThresholds
            .map((treshold: LevelThreshold) =>
                guild.roles.create({
                    name: `Level ${treshold.level}`,
                    color: treshold.color,
                    hoist: hoist || false,
                    position: -1
                })
            )
    );
}

const deleteLevelRoles = async (guild: Guild) => {
    const levelRoles = guild.roles.cache.filter(role => levelRoleRegExp.test(role.name));
    if (!levelRoles.size) return;

    return Promise.all(
        levelRoles.map((role: Role) => role.delete())
    );
}

interface AssignLevelRolesInGuildProps {
    client: ExtendedClient;
    guildId: string;

}

const assignLevelRolesInGuild = async ({ client, guildId }: AssignLevelRolesInGuildProps) => {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return null;

    const members = await guild.members.fetch();
    return Promise.all(
        members
            .filter(member => !member.user.bot)
            .map((member) => 
                assignUserLevelRole({
                    client,
                    userId: member.user.id,
                    guildId: guild.id,
                })
            )
    );
}

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

const checkColorLuminance = (hex: string, luminanceTreshold?: number) => {
    const color = chroma(hex);
    const luminance = color.luminance();
    return luminance > (luminanceTreshold || 0.2);
};

const isLevelThreshold = (level: number) => {
    return levelThresholds.some(t => t.level === level);
}

export { isLevelThreshold, getGuildTresholdRole, assignLevelRolesInGuild, assignUserLevelRole, checkColorLuminance, deleteLevelRoles, getLevelRoleThreshold, getMemberColorRole, levelRoleRegExp, syncGuildLevelRoles, syncGuildLevelRolesHoisting, updateColorRole };


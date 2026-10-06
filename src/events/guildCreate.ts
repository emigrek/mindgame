import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import {Event} from "@/interfaces";
import {setDefaultChannelId} from "@/modules/guild";
import {createGuild} from "@/modules/guild/";
import {InformationEmbed} from "@/modules/messages/embeds";
import {assignLevelRolesInGuild} from "@/modules/roles/";
import {ChannelType, Guild, NonThreadGuildBasedChannel, PermissionsBitField, TextChannel} from "discord.js";

const checkClientMissingPermissions = async (guild: Guild): Promise<string[] | false> => {
    // A cache miss must not look like missing permissions, that makes the bot leave the guild
    const me = guild.members.me ?? await guild.members.fetchMe().catch(() => null);
    if (!me) return false;
    
    const permissions = me.permissions;
    const requiredPermissionsInteger = BigInt(395405552720);
    const requiredPermissions = new PermissionsBitField(requiredPermissionsInteger);

    return permissions.missing(requiredPermissions);
};

export const guildCreate: Event = {
    name: "guildCreate",
    run: async (client: ExtendedClient, guild: Guild) => {
        const owner = await client.users.fetch(guild.ownerId);

        const missingPermissions = await checkClientMissingPermissions(guild);
        if(!missingPermissions || missingPermissions.length) {
            // Owners with closed DMs would otherwise keep the bot in a guild it can't work in
            await owner?.send({
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("utils.missingPermissions"))
                ]
            }).catch(() => null);
            await guild.leave();
            return;
        }

        const channels = await guild.channels.fetch();
        const textChannels = channels.filter((channel: NonThreadGuildBasedChannel | null) => channel && channel.type === ChannelType.GuildText);

        if(!textChannels.size) {
            await owner?.send({
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("config.noValidChannels"))
                ]
            });
            return;
        }

        // The guild document must exist first, setDefaultChannelId only updates existing ones
        const sourceGuild = await createGuild(guild.id);
        const proposedTextChannel = textChannels.first() as TextChannel;
        await setDefaultChannelId({guildId: guild.id, channelId: proposedTextChannel.id});

        if(sourceGuild.levelRoles)
            await assignLevelRolesInGuild({client, guildId: guild.id});
    }
}
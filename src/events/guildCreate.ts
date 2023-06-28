import { BaseChannel, ChannelType, Guild, PermissionsBitField, TextChannel } from "discord.js";
import { Event } from "@/interfaces";
import { createGuild } from "@/modules/guild/";
import { updatePresence } from "@/modules/presence/";
import { assignLevelRolesInGuild } from "@/modules/roles/";
import { setDefaultChannelId } from "@/modules/guild";
import i18n from "@/client/i18n";
import { InformationEmbed } from "@/modules/messages/embeds";

const checkClientMissingPermissions = (guild: Guild): string[] | false => {
    const me = guild.members.cache.get(guild.client.user.id);
    if (!me) return false;
    
    const permissions = me.permissions;
    const requiredPermissionsInteger = BigInt(395405552720);
    const requiredPermissions = new PermissionsBitField(requiredPermissionsInteger);
    const missingPermissions = permissions.missing(requiredPermissions);

    return missingPermissions;
};

export const guildCreate: Event = {
    name: "guildCreate",
    run: async (client, guild) => {
        const owner = await client.users.fetch(guild.ownerId);

        const missingPermissions = checkClientMissingPermissions(guild);
        if(!missingPermissions || missingPermissions.length) {
            await owner?.send({
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("utils.missingPermissions"))
                ]
            });
            await guild.leave();
            return;
        }

        const sourceGuild = await createGuild(guild);
        await updatePresence(client);

        if(sourceGuild.levelRoles)
            await assignLevelRolesInGuild(client, guild);

        const textChannels = guild.channels.cache.filter((channel: BaseChannel) => channel.type === ChannelType.GuildText);

        if(!textChannels.size) {
            await owner?.send({
                embeds: [
                    InformationEmbed()
                        .setDescription(i18n.__("config.noValidChannels"))
                ]
            });
            return;
        }

        const proposedTextChannel = textChannels.first() as TextChannel;
        await setDefaultChannelId(guild, proposedTextChannel.id);
    }
}
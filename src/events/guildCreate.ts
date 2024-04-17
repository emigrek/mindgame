import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import {Event} from "@/interfaces";
import {setDefaultChannelId} from "@/modules/guild";
import {createGuild} from "@/modules/guild/";
import {InformationEmbed} from "@/modules/messages/embeds";
import {assignLevelRolesInGuild} from "@/modules/roles/";
import {ChannelType, Guild, NonThreadGuildBasedChannel, PermissionsBitField, TextChannel} from "discord.js";

const checkClientMissingPermissions = (guild: Guild): string[] | false => {
    const me = guild.members.cache.get(guild.client.user.id);
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

        const proposedTextChannel = textChannels.first() as TextChannel;
        await setDefaultChannelId({guildId: guild.id, channelId: proposedTextChannel.id});

        const sourceGuild = await createGuild(guild.id);

        if(sourceGuild.levelRoles)
            await assignLevelRolesInGuild({client, guildId: guild.id});
    }
}
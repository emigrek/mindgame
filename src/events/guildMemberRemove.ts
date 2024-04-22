import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {getMemberColorRole} from "@/modules/roles";
import {deleteUserGuildStatistics} from "@/modules/user-guild-statistics";
import {GuildMember} from "discord.js";
import {endPresenceActivity, endVoiceActivity} from "@/modules/activity";

export const guildMemberRemove: Event = {
    name: "guildMemberRemove",
    run: async (client: ExtendedClient, member: GuildMember) => {
        await endVoiceActivity(member);
        await endPresenceActivity(member.user.id, member.guild.id);
        await deleteUserGuildStatistics({ 
            userId: member.id,
            guildId: member.guild.id
        });
        await getMemberColorRole(member)?.delete()
            .catch(e => {
                console.log(`There was an error when removing level role after member left guild: ${e}`)
            });
    }
}
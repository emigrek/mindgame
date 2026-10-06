import {Event} from "@/interfaces";
import {deleteMemberColorRole} from "@/modules/roles";
import {deleteUserGuildStatistics} from "@/modules/user-guild-statistics";
import {endPresenceActivity, endVoiceActivity} from "@/modules/activity";

export const guildMemberRemove: Event<"guildMemberRemove"> = {
    name: "guildMemberRemove",
    run: async (client, member) => {
        await endVoiceActivity(member);
        await endPresenceActivity(member.user.id, member.guild.id);
        await deleteUserGuildStatistics({ 
            userId: member.id,
            guildId: member.guild.id
        });
        await deleteMemberColorRole(member)
            .catch(e => {
                console.log(`There was an error when removing color role after member left guild: ${e}`)
            });
    }
}
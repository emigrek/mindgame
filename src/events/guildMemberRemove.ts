import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getMemberColorRole } from "@/modules/roles";
import { GuildMember } from "discord.js";

export const guildMemberRemove: Event = {
    name: "guildMemberRemove",
    run: async (client: ExtendedClient, member: GuildMember) => {
        const colorRole = getMemberColorRole(member);

        if (colorRole) {
            await colorRole.delete()
                .catch(e => {
                    console.log(`There was an error when removing level role after member left guild: ${e}`)
                });
        }
    }
}
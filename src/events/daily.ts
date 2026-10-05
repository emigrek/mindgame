import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Regular } from "@/modules/achievement/achievements";
import { clearTemporaryStatistics } from "@/modules/user-guild-statistics";

export const daily: Event = {
    name: "daily",
    run: async (client: ExtendedClient) => {
        await clearTemporaryStatistics('day');

        // Covers members who neither write nor join voice
        for (const guild of client.guilds.cache.values()) {
            const members = await guild.members.fetch()
                .catch(e => console.log(`Error while fetching members of guild ${guild.id}: `, e));
            if (!members) continue;

            // ponytail: one check per member at once, batch it if guilds grow to many thousands
            members
                .filter(member => !member.user.bot)
                .forEach(member => new AchievementManager({ client, userId: member.id, guildId: guild.id })
                    .check(new Regular({ member })));
        }
    }
}

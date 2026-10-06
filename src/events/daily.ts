import { AchievementType, Event } from "@/interfaces";
import { AchievementManager, achievementModel } from "@/modules/achievement";
import { Regular } from "@/modules/achievement/achievements";
import { clearTemporaryStatistics } from "@/modules/user-guild-statistics";
import moment from "moment";

export const daily: Event<"daily"> = {
    name: "daily",
    run: async (client) => {
        await clearTemporaryStatistics('day');

        // Covers members who neither write nor join voice. One query per guild finds whose membership crossed a
        // Regular threshold, instead of a concurrent check (and query) per member at midnight.
        const regular = new Regular();
        for (const guild of client.guilds.cache.values()) {
            const members = await guild.members.fetch()
                .catch(e => console.log(`Error while fetching members of guild ${guild.id}: `, e));
            if (!members) continue;

            const achievements = await achievementModel
                .find({ guildId: guild.id, achievementType: AchievementType.REGULAR }, { userId: 1, level: 1 })
                .lean();
            const levels = new Map(achievements.map(({ userId, level }) => [userId, level]));

            members
                .filter(member => !member.user.bot && member.joinedAt)
                .filter(member => {
                    const months = moment().diff(member.joinedAt, "months");
                    return (regular.findClosestLevelThreshold(months)?.level ?? 0) > (levels.get(member.id) ?? 0);
                })
                .forEach(member => new AchievementManager({ client, userId: member.id, guildId: guild.id })
                    .check(new Regular({ member })));
        }
    }
}

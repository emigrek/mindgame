import i18n from "@/client/i18n";
import { AchievementType } from "@/interfaces";
import { achievementModel } from "./model";

// Percent of the guild's members with any achievement progress who reached a level or higher.
// Members who left keep their achievements, so they count on both sides.
// Own module, so notifications can import it without the achievement index (which imports every achievement)
export const getRarity = async (guildId: string) => {
    const [members, counts] = await Promise.all([
        achievementModel.distinct("userId", { guildId }),
        achievementModel.aggregate<{ _id: { type: AchievementType, level: number }, count: number }>([
            { $match: { guildId, level: { $gt: 0 } } },
            { $group: { _id: { type: "$achievementType", level: "$level" }, count: { $sum: 1 } } },
        ]),
    ]);

    return (type: AchievementType, level: number) => {
        if (!level || !members.length)
            return undefined;
        const reached = counts
            .filter(({ _id }) => _id.type === type && _id.level >= level)
            .reduce((sum, { count }) => sum + count, 0);
        return reached / members.length * 100;
    };
};

export const formatRarity = (percent: number) =>
    i18n.__mf("achievements.misc.rarity", { percent: percent < 1 ? "<1" : Math.round(percent) });

import i18n from "@/client/i18n";
import { Streak } from "@/interfaces";
import { codeBlock } from "discord.js";

import { getLocalizedDateRange } from "@/utils/date";

const formatStreakField = (streak?: Streak, includeDateRange?: boolean) => {
    return streak && streak.value > 1 ?
        `${includeDateRange ? getLocalizedDateRange(streak.startedAt, streak.date) : ''}${codeBlock(i18n.__n("notifications.voiceStreakFormat", streak.value || 0))}`
        :
        codeBlock(i18n.__("utils.lack"));
}

const formatNextStreakField = (daysTillNext: number) => {
    return daysTillNext ? codeBlock(i18n.__n("notifications.voiceStreakInFormat", daysTillNext)) : codeBlock(i18n.__("utils.never"));
}

export { formatStreakField, formatNextStreakField };

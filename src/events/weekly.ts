import { Event } from "@/interfaces";
import { checkWeeklyKings } from "@/modules/achievement/achievements";
import { clearTemporaryStatistics } from "@/modules/user-guild-statistics";

export const weekly: Event<"weekly"> = {
    name: "weekly",
    run: async (client) => {
        // Reads the week statistics, so it runs before they are cleared
        await checkWeeklyKings(client);
        await clearTemporaryStatistics('week');
    }
}
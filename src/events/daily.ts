import { Event } from "@/interfaces";
import { clearTemporaryStatistics } from "@/modules/user-guild-statistics";

export const daily: Event = {
    name: "daily",
    run: async () => {
        await clearTemporaryStatistics('day');
    }
}
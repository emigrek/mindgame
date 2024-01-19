import { Event } from "@/interfaces";
import { pruneActivities } from "@/modules/activity";
import { clearTemporaryStatistics } from "@/modules/user";

export const monthly: Event = {
    name: "monthly",
    run: async () => {
        await clearTemporaryStatistics('month');
        await pruneActivities();
    }
}
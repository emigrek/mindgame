import { Event } from "@/interfaces";
import { clearTemporaryStatistics } from "@/modules/user-guild-statistics";

export const weekly: Event<"weekly"> = {
    name: "weekly",
    run: async () => {
        await clearTemporaryStatistics('week');
    }
}
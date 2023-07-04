import { Event } from "@/interfaces";
import { clearTemporaryStatistics } from "@/modules/user";

export const monthly: Event = {
    name: "monthly",
    run: async () => {
        await clearTemporaryStatistics('month');
    }
}
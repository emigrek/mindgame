import { Event } from "@/interfaces";
import { clearTemporaryStatistics } from "@/modules/user-guild-statistics";

export const monthly: Event<"monthly"> = {
    name: "monthly",
    run: async () => {
        await clearTemporaryStatistics('month');
    }
}
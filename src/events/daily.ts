import { Event } from "@/interfaces";
import { clearTemporaryStatistics } from "@/modules/user";

export const daily: Event = {
    name: "daily",
    run: async () => {
        await clearTemporaryStatistics('day');
    }
}
import { Event } from "../interfaces";
import { clearTemporaryStatistics } from "../modules/user";

export const weekly: Event = {
    name: "weekly",
    run: async (client) => {
        await clearTemporaryStatistics(client, 'week');
    }
}
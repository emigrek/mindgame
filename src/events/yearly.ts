import { Event } from "@/interfaces";
import { pruneActivities } from "@/modules/activity";
import { clearExperience } from "@/modules/user";

export const yearly: Event = {
    name: "yearly",
    run: async () => {
        await clearExperience();
        await pruneActivities();
    }
}
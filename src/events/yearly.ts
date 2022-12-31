import { Event } from "../interfaces";
import { clearExperience } from "../modules/user";

export const yearly: Event = {
    name: "yearly",
    run: async (client) => {
        await clearExperience();
    }
}
import { Event } from "../interfaces";
import { assignLevelRolesInAllGuilds } from "../modules/roles";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client, user) => {
        await assignLevelRolesInAllGuilds(client, user);
    }
}
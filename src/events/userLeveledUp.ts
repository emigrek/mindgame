import { Event } from "../interfaces";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client, sourceUser, user) => {
        console.log(`[userLeveledUp] ${sourceUser.tag} leveled up to level ${sourceUser.stats.level}!`);
    }
}
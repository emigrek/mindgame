import { Module } from "@/interfaces";
import { validatePresenceActivities, validateVoiceActivities } from "@/modules/activity";

export const activities: Module = {
    name: "activities",
    run: async (client) => {
        await validateVoiceActivities(client)
            .then((outOfSync) => {
                if(!outOfSync.length) return;
                console.log(`Detected ${outOfSync.length} voice activities out of sync with database.`);
            });

        await validatePresenceActivities(client)
            .then((outOfSync) => {
                if(!outOfSync.length) return;
                console.log(`Detected ${outOfSync.length} presence activities out of sync with database.`);
            });
    }
}   